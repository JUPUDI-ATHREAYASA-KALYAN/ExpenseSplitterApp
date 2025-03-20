using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FullStackApp.DTOs
{
    public class CreateExpenseDTO
    {
        [Required]
        public Guid GroupId { get; set; }

        [Required]
        [StringLength(200, MinimumLength = 2)]
        public string Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public Guid PaidById { get; set; }

        [Required]
        public List<ExpenseSplitDTO> Splits { get; set; }
    }

    public class ExpenseDTO
    {
        public Guid Id { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsSettled { get; set; }
        public UserDTO PaidBy { get; set; }
        public GroupSummaryDTO Group { get; set; }
        public List<ExpenseSplitDTO> Splits { get; set; }
        public List<SettlementDTO> Settlements { get; set; }
    }

    public class ExpenseSplitDTO
    {
        public Guid UserId { get; set; }
        public UserDTO User { get; set; }
        public decimal Amount { get; set; }
        public bool IsPaid { get; set; }
    }

    public class SettleExpenseDTO
    {
        [Required]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [Required]
        public Guid PayerId { get; set; }

        [Required]
        public Guid PayeeId { get; set; }

        [StringLength(50)]
        public string Method { get; set; }

        [StringLength(500)]
        public string Notes { get; set; }
    }

    public class SettlementDTO
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Method { get; set; }
        public string Notes { get; set; }
        public UserDTO Payer { get; set; }
        public UserDTO Payee { get; set; }
    }

    public class BalanceDTO
    {
        public UserDTO From { get; set; }
        public UserDTO To { get; set; }
        public decimal Amount { get; set; }
    }
}
