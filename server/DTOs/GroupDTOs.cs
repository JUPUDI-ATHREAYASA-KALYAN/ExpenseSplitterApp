using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FullStackApp.DTOs
{
    public class CreateGroupDTO
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }
    }

    public class GroupDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public UserDTO CreatedBy { get; set; }
        public List<UserDTO> Members { get; set; }
    }

    public class GroupSummaryDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public int MemberCount { get; set; }
        public int ExpenseCount { get; set; }
    }

    public class InviteToGroupDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; }
    }

    public class GroupInvitationDTO
    {
        public Guid Id { get; set; }
        public GroupSummaryDTO Group { get; set; }
        public UserDTO InvitedBy { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
    }
}
