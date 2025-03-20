using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FullStackApp.Data;
using FullStackApp.DTOs;
using FullStackApp.Models;

namespace FullStackApp.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ExpenseController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("group/{groupId}")]
        public async Task<ActionResult<List<ExpenseDTO>>> GetGroupExpenses(Guid groupId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Check if user is a member of the group
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == userId);

            if (!isMember)
            {
                return Forbid();
            }

            var expenses = await _context.Expenses
                .Include(e => e.PaidBy)
                .Include(e => e.Group)
                .Include(e => e.Splits).ThenInclude(s => s.User)
                .Include(e => e.Settlements)
                .Where(e => e.GroupId == groupId)
                .OrderByDescending(e => e.Date)
                .Select(e => new ExpenseDTO
                {
                    Id = e.Id,
                    Description = e.Description,
                    Amount = e.Amount,
                    Date = e.Date,
                    CreatedAt = e.CreatedAt,
                    IsSettled = e.IsSettled,
                    PaidBy = new UserDTO
                    {
                        Id = e.PaidBy.Id,
                        Name = e.PaidBy.Name,
                        Email = e.PaidBy.Email
                    },
                    Group = new GroupSummaryDTO
                    {
                        Id = e.Group.Id,
                        Name = e.Group.Name,
                        Description = e.Group.Description,
                        CreatedAt = e.Group.CreatedAt,
                        MemberCount = _context.GroupMembers.Count(m => m.GroupId == e.GroupId),
                        ExpenseCount = _context.Expenses.Count(ex => ex.GroupId == e.GroupId)
                    },
                    Splits = e.Splits.Select(s => new ExpenseSplitDTO
                    {
                        UserId = s.UserId,
                        User = new UserDTO
                        {
                            Id = s.User.Id,
                            Name = s.User.Name,
                            Email = s.User.Email
                        },
                        Amount = s.Amount,
                        IsPaid = s.IsPaid
                    }).ToList(),
                    Settlements = e.Settlements.Select(s => new SettlementDTO
                    {
                        Id = s.Id,
                        Amount = s.Amount,
                        Date = s.Date,
                        Method = s.Method,
                        Notes = s.Notes,
                        Payer = new UserDTO
                        {
                            Id = s.Payer.Id,
                            Name = s.Payer.Name,
                            Email = s.Payer.Email
                        },
                        Payee = new UserDTO
                        {
                            Id = s.Payee.Id,
                            Name = s.Payee.Name,
                            Email = s.Payee.Email
                        }
                    }).ToList()
                })
                .ToListAsync();

            return expenses;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseDTO>> GetExpense(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expense = await _context.Expenses
                .Include(e => e.PaidBy)
                .Include(e => e.Group)
                .Include(e => e.Splits).ThenInclude(s => s.User)
                .Include(e => e.Settlements)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
            {
                return NotFound();
            }

            // Check if user is a member of the group
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == expense.GroupId && gm.UserId == userId);

            if (!isMember)
            {
                return Forbid();
            }

            return new ExpenseDTO
            {
                Id = expense.Id,
                Description = expense.Description,
                Amount = expense.Amount,
                Date = expense.Date,
                CreatedAt = expense.CreatedAt,
                IsSettled = expense.IsSettled,
                PaidBy = new UserDTO
                {
                    Id = expense.PaidBy.Id,
                    Name = expense.PaidBy.Name,
                    Email = expense.PaidBy.Email
                },
                Group = new GroupSummaryDTO
                {
                    Id = expense.Group.Id,
                    Name = expense.Group.Name,
                    Description = expense.Group.Description,
                    CreatedAt = expense.Group.CreatedAt,
                    MemberCount = _context.GroupMembers.Count(m => m.GroupId == expense.GroupId),
                    ExpenseCount = _context.Expenses.Count(e => e.GroupId == expense.GroupId)
                },
                Splits = expense.Splits.Select(s => new ExpenseSplitDTO
                {
                    UserId = s.UserId,
                    User = new UserDTO
                    {
                        Id = s.User.Id,
                        Name = s.User.Name,
                        Email = s.User.Email
                    },
                    Amount = s.Amount,
                    IsPaid = s.IsPaid
                }).ToList(),
                Settlements = expense.Settlements.Select(s => new SettlementDTO
                {
                    Id = s.Id,
                    Amount = s.Amount,
                    Date = s.Date,
                    Method = s.Method,
                    Notes = s.Notes,
                    Payer = new UserDTO
                    {
                        Id = s.Payer.Id,
                        Name = s.Payer.Name,
                        Email = s.Payer.Email
                    },
                    Payee = new UserDTO
                    {
                        Id = s.Payee.Id,
                        Name = s.Payee.Name,
                        Email = s.Payee.Email
                    }
                }).ToList()
            };
        }

        [HttpPost]
        public async Task<ActionResult<ExpenseDTO>> CreateExpense(CreateExpenseDTO createExpenseDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Check if user is a member of the group
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == createExpenseDto.GroupId && gm.UserId == userId);

            if (!isMember)
            {
                return Forbid();
            }

            // Validate that all users in splits are members of the group
            foreach (var split in createExpenseDto.Splits)
            {
                var isUserMember = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupId == createExpenseDto.GroupId && gm.UserId == split.UserId);

                if (!isUserMember)
                {
                    return BadRequest($"User with ID {split.UserId} is not a member of this group");
                }
            }

            // Validate that the total of splits equals the expense amount
            var totalSplitAmount = createExpenseDto.Splits.Sum(s => s.Amount);
            if (totalSplitAmount != createExpenseDto.Amount)
            {
                return BadRequest("The sum of split amounts must equal the total expense amount");
            }

            // Create the expense
            var expense = new Expense
            {
                Id = Guid.NewGuid(),
                GroupId = createExpenseDto.GroupId,
                PaidById = createExpenseDto.PaidById,
                Description = createExpenseDto.Description,
                Amount = createExpenseDto.Amount,
                Date = createExpenseDto.Date,
                CreatedAt = DateTime.UtcNow,
                IsSettled = false
            };

            _context.Expenses.Add(expense);

            // Create the expense splits
            foreach (var splitDto in createExpenseDto.Splits)
            {
                var split = new ExpenseSplit
                {
                    Id = Guid.NewGuid(),
                    ExpenseId = expense.Id,
                    UserId = splitDto.UserId,
                    Amount = splitDto.Amount,
                    IsPaid = splitDto.UserId == createExpenseDto.PaidById // Payer's split is marked as paid
                };

                _context.ExpenseSplits.Add(split);
            }

            await _context.SaveChangesAsync();

            // Fetch the created expense with all relationships
            return await GetExpense(expense.Id);
        }

        [HttpPost("{id}/settle")]
        public async Task<ActionResult<SettlementDTO>> SettleExpense(Guid id, SettleExpenseDTO settleExpenseDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Ensure the payer is the current user
            if (settleExpenseDto.PayerId != userId)
            {
                return BadRequest("You can only settle expenses for yourself");
            }

            var expense = await _context.Expenses
                .Include(e => e.Splits)
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
            {
                return NotFound();
            }

            // Check if user is a member of the group
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == expense.GroupId && gm.UserId == userId);

            if (!isMember)
            {
                return Forbid();
            }

            // Check if the payee is the person who paid for the expense
            if (settleExpenseDto.PayeeId != expense.PaidById)
            {
                return BadRequest("Settlement must be to the person who paid for the expense");
            }

            // Find the payer's split
            var payerSplit = expense.Splits.FirstOrDefault(s => s.UserId == userId);
            if (payerSplit == null)
            {
                return BadRequest("You don't have a share in this expense");
            }

            // Check if the split is already paid
            if (payerSplit.IsPaid)
            {
                return BadRequest("Your share of this expense is already paid");
            }

            // Validate settlement amount does not exceed the split amount
            if (settleExpenseDto.Amount > payerSplit.Amount)
            {
                return BadRequest("Settlement amount cannot exceed your share of the expense");
            }

            // Create the settlement
            var settlement = new Settlement
            {
                Id = Guid.NewGuid(),
                ExpenseId = expense.Id,
                PayerId = userId,
                PayeeId = expense.PaidById,
                Amount = settleExpenseDto.Amount,
                Date = settleExpenseDto.Date,
                Method = settleExpenseDto.Method,
                Notes = settleExpenseDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Settlements.Add(settlement);

            // If the settlement is full, mark the split as paid
            if (settleExpenseDto.Amount == payerSplit.Amount)
            {
                payerSplit.IsPaid = true;
            }

            // Check if all splits are now paid
            if (expense.Splits.All(s => s.IsPaid || s.UserId == expense.PaidById))
            {
                expense.IsSettled = true;
            }

            await _context.SaveChangesAsync();

            var payerUser = await _context.Users.FindAsync(userId);
            var payeeUser = await _context.Users.FindAsync(expense.PaidById);

            return new SettlementDTO
            {
                Id = settlement.Id,
                Amount = settlement.Amount,
                Date = settlement.Date,
                Method = settlement.Method,
                Notes = settlement.Notes,
                Payer = new UserDTO
                {
                    Id = payerUser.Id,
                    Name = payerUser.Name,
                    Email = payerUser.Email
                },
                Payee = new UserDTO
                {
                    Id = payeeUser.Id,
                    Name = payeeUser.Name,
                    Email = payeeUser.Email
                }
            };
        }

        [HttpGet("group/{groupId}/balances")]
        public async Task<ActionResult<List<BalanceDTO>>> GetGroupBalances(Guid groupId)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Check if user is a member of the group
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == userId);

            if (!isMember)
            {
                return Forbid();
            }

            // Get all group members
            var groupMembers = await _context.GroupMembers
                .Where(gm => gm.GroupId == groupId)
                .Include(gm => gm.User)
                .ToListAsync();

            // Get all expenses for the group
            var expenses = await _context.Expenses
                .Where(e => e.GroupId == groupId)
                .Include(e => e.Splits)
                .Include(e => e.Settlements)
                .ToListAsync();

            var balances = new Dictionary<Guid, decimal>(); // userId -> netBalance

            // Initialize balances for all members
            foreach (var member in groupMembers)
            {
                balances[member.UserId] = 0;
            }

            // Calculate balances from expenses
            foreach (var expense in expenses)
            {
                // The person who paid gets a positive balance for what others owe them
                if (balances.ContainsKey(expense.PaidById))
                {
                    balances[expense.PaidById] += expense.Amount;
                }

                // Each person who has a split gets a negative balance for what they owe
                foreach (var split in expense.Splits)
                {
                    if (balances.ContainsKey(split.UserId))
                    {
                        balances[split.UserId] -= split.Amount;
                    }
                }
            }

            // Adjust balances based on settlements
            foreach (var expense in expenses)
            {
                foreach (var settlement in expense.Settlements)
                {
                    if (balances.ContainsKey(settlement.PayerId))
                    {
                        balances[settlement.PayerId] += settlement.Amount;
                    }
                    if (balances.ContainsKey(settlement.PayeeId))
                    {
                        balances[settlement.PayeeId] -= settlement.Amount;
                    }
                }
            }

            // Convert balances to a list of BalanceDTO objects
            var result = new List<BalanceDTO>();

            // Find optimal settlement plan (simplified)
            var debtors = groupMembers
                .Where(m => balances[m.UserId] < 0)
                .Select(m => (User: m.User, Balance: balances[m.UserId]))
                .OrderBy(x => x.Balance)
                .ToList();

            var creditors = groupMembers
                .Where(m => balances[m.UserId] > 0)
                .Select(m => (User: m.User, Balance: balances[m.UserId]))
                .OrderByDescending(x => x.Balance)
                .ToList();

            // Create settlements
            int i = 0, j = 0;
            while (i < debtors.Count && j < creditors.Count)
            {
                var debtor = debtors[i];
                var creditor = creditors[j];

                var amount = Math.Min(Math.Abs(debtor.Balance), creditor.Balance);
                
                if (amount > 0.01m) // Ignore very small balances
                {
                    result.Add(new BalanceDTO
                    {
                        From = new UserDTO
                        {
                            Id = debtor.User.Id,
                            Name = debtor.User.Name,
                            Email = debtor.User.Email
                        },
                        To = new UserDTO
                        {
                            Id = creditor.User.Id,
                            Name = creditor.User.Name,
                            Email = creditor.User.Email
                        },
                        Amount = Math.Round(amount, 2)
                    });
                }

                // Update balances
                debtors[i] = (debtor.User, debtor.Balance + amount);
                creditors[j] = (creditor.User, creditor.Balance - amount);

                // Move to next person if their balance is settled
                if (Math.Abs(debtors[i].Balance) < 0.01m)
                {
                    i++;
                }
                if (creditors[j].Balance < 0.01m)
                {
                    j++;
                }
            }

            return result;
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteExpense(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == id);

            if (expense == null)
            {
                return NotFound();
            }

            // Check if user is a member of the group
            var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == expense.GroupId && gm.UserId == userId);

            if (!isMember)
            {
                return Forbid();
            }

            // Only the person who created the expense or the group creator can delete it
            var isExpenseCreator = expense.PaidById == userId;
            var isGroupCreator = await _context.Groups
                .AnyAsync(g => g.Id == expense.GroupId && g.CreatedById == userId);

            if (!isExpenseCreator && !isGroupCreator)
            {
                return Forbid();
            }

            // Check if there are any settlements for this expense
            var hasSettlements = await _context.Settlements
                .AnyAsync(s => s.ExpenseId == id);

            if (hasSettlements)
            {
                return BadRequest("Cannot delete an expense that has settlements. Please delete the settlements first.");
            }

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
