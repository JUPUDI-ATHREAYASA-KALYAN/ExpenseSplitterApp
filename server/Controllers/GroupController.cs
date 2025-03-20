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
    public class GroupController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public GroupController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<List<GroupSummaryDTO>>> GetUserGroups()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var userGroups = await _context.GroupMembers
                .Where(gm => gm.UserId == userId)
                .Include(gm => gm.Group)
                .Select(gm => new GroupSummaryDTO
                {
                    Id = gm.Group.Id,
                    Name = gm.Group.Name,
                    Description = gm.Group.Description,
                    CreatedAt = gm.Group.CreatedAt,
                    MemberCount = _context.GroupMembers.Count(m => m.GroupId == gm.GroupId),
                    ExpenseCount = _context.Expenses.Count(e => e.GroupId == gm.GroupId)
                })
                .ToListAsync();

            return userGroups;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<GroupDTO>> GetGroup(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Check if user is a member of the group
            var membership = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == id && gm.UserId == userId);

            if (membership == null)
            {
                return Forbid();
            }

            var group = await _context.Groups
                .Include(g => g.CreatedBy)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (group == null)
            {
                return NotFound();
            }

            var members = await _context.GroupMembers
                .Where(gm => gm.GroupId == id)
                .Include(gm => gm.User)
                .Select(gm => new UserDTO
                {
                    Id = gm.User.Id,
                    Name = gm.User.Name,
                    Email = gm.User.Email
                })
                .ToListAsync();

            return new GroupDTO
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedAt = group.CreatedAt,
                CreatedBy = new UserDTO
                {
                    Id = group.CreatedBy.Id,
                    Name = group.CreatedBy.Name,
                    Email = group.CreatedBy.Email
                },
                Members = members
            };
        }

        [HttpPost]
        public async Task<ActionResult<GroupDTO>> CreateGroup(CreateGroupDTO createGroupDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return Unauthorized();
            }

            var group = new Group
            {
                Id = Guid.NewGuid(),
                Name = createGroupDto.Name,
                Description = createGroupDto.Description,
                CreatedById = userId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Groups.Add(group);

            // Add creator as a member of the group
            var groupMember = new GroupMember
            {
                Id = Guid.NewGuid(),
                GroupId = group.Id,
                UserId = userId,
                JoinedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.GroupMembers.Add(groupMember);
            await _context.SaveChangesAsync();

            return new GroupDTO
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatedAt = group.CreatedAt,
                CreatedBy = new UserDTO
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email
                },
                Members = new List<UserDTO>
                {
                    new UserDTO
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email
                    }
                }
            };
        }

        [HttpPost("{id}/invite")]
        public async Task<ActionResult> InviteToGroup(Guid id, InviteToGroupDTO inviteDto)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            // Check if user is a member of the group
            var membership = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == id && gm.UserId == userId);

            if (!membership)
            {
                return Forbid();
            }

            // Check if the email is already registered
            var invitedUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == inviteDto.Email.ToLower());

            // Check if the user is already a member of the group
            if (invitedUser != null)
            {
                var existingMembership = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupId == id && gm.UserId == invitedUser.Id);

                if (existingMembership)
                {
                    return BadRequest("User is already a member of this group");
                }
            }

            // Check if there's an existing pending invitation
            var existingInvitation = await _context.GroupInvitations
                .FirstOrDefaultAsync(gi => gi.GroupId == id && 
                                    (gi.InvitedEmail == inviteDto.Email.ToLower() || 
                                    (invitedUser != null && gi.InvitedUserId == invitedUser.Id)) &&
                                    gi.Status == InvitationStatus.Pending);

            if (existingInvitation != null)
            {
                return BadRequest("An invitation has already been sent to this email");
            }

            // Create a new invitation
            var invitation = new GroupInvitation
            {
                Id = Guid.NewGuid(),
                GroupId = id,
                InvitedById = userId,
                InvitedEmail = inviteDto.Email.ToLower(),
                InvitedUserId = invitedUser?.Id,
                CreatedAt = DateTime.UtcNow,
                Status = InvitationStatus.Pending
            };

            _context.GroupInvitations.Add(invitation);
            await _context.SaveChangesAsync();

            // TODO: Send email notification to invited user

            return Ok();
        }

        [HttpPost("invitations/{id}/accept")]
        public async Task<ActionResult> AcceptInvitation(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);

            var invitation = await _context.GroupInvitations
                .Include(gi => gi.Group)
                .FirstOrDefaultAsync(gi => gi.Id == id && 
                                    (gi.InvitedUserId == userId || 
                                    gi.InvitedEmail == user.Email) &&
                                    gi.Status == InvitationStatus.Pending);

            if (invitation == null)
            {
                return NotFound();
            }

            // Check if user is already a member
            var existingMembership = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == invitation.GroupId && gm.UserId == userId);

            if (existingMembership)
            {
                // Update invitation status
                invitation.Status = InvitationStatus.Accepted;
                invitation.AcceptedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                
                return BadRequest("You are already a member of this group");
            }

            // Add user to the group
            var groupMember = new GroupMember
            {
                Id = Guid.NewGuid(),
                GroupId = invitation.GroupId,
                UserId = userId,
                JoinedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.GroupMembers.Add(groupMember);

            // Update invitation status
            invitation.Status = InvitationStatus.Accepted;
            invitation.AcceptedAt = DateTime.UtcNow;
            if (invitation.InvitedUserId == null)
            {
                invitation.InvitedUserId = userId;
            }

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpPost("invitations/{id}/reject")]
        public async Task<ActionResult> RejectInvitation(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);

            var invitation = await _context.GroupInvitations
                .FirstOrDefaultAsync(gi => gi.Id == id && 
                                    (gi.InvitedUserId == userId || 
                                    gi.InvitedEmail == user.Email) &&
                                    gi.Status == InvitationStatus.Pending);

            if (invitation == null)
            {
                return NotFound();
            }

            // Update invitation status
            invitation.Status = InvitationStatus.Rejected;
            invitation.RejectedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("invitations")]
        public async Task<ActionResult<List<GroupInvitationDTO>>> GetUserInvitations()
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var user = await _context.Users.FindAsync(userId);

            var invitations = await _context.GroupInvitations
                .Include(gi => gi.Group)
                .Include(gi => gi.InvitedBy)
                .Where(gi => (gi.InvitedUserId == userId || 
                             gi.InvitedEmail == user.Email) &&
                             gi.Status == InvitationStatus.Pending)
                .Select(gi => new GroupInvitationDTO
                {
                    Id = gi.Id,
                    Group = new GroupSummaryDTO
                    {
                        Id = gi.Group.Id,
                        Name = gi.Group.Name,
                        Description = gi.Group.Description,
                        CreatedAt = gi.Group.CreatedAt,
                        MemberCount = _context.GroupMembers.Count(m => m.GroupId == gi.GroupId),
                        ExpenseCount = _context.Expenses.Count(e => e.GroupId == gi.GroupId)
                    },
                    InvitedBy = new UserDTO
                    {
                        Id = gi.InvitedBy.Id,
                        Name = gi.InvitedBy.Name,
                        Email = gi.InvitedBy.Email
                    },
                    CreatedAt = gi.CreatedAt,
                    Status = gi.Status.ToString()
                })
                .ToListAsync();

            return invitations;
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGroup(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            var group = await _context.Groups
                .FirstOrDefaultAsync(g => g.Id == id && g.CreatedById == userId);

            if (group == null)
            {
                return NotFound();
            }

            _context.Groups.Remove(group);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}/leave")]
        public async Task<ActionResult> LeaveGroup(Guid id)
        {
            var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            
            var membership = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == id && gm.UserId == userId);

            if (membership == null)
            {
                return NotFound();
            }

            // Check if user is the creator
            var isCreator = await _context.Groups
                .AnyAsync(g => g.Id == id && g.CreatedById == userId);

            if (isCreator)
            {
                return BadRequest("Group creator cannot leave the group. You must delete the group instead.");
            }

            _context.GroupMembers.Remove(membership);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
