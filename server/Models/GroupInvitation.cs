using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullStackApp.Models
{
    public class GroupInvitation
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public Guid InvitedById { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string InvitedEmail { get; set; }

        public Guid? InvitedUserId { get; set; }

        public DateTime CreatedAt { get; set; }
        
        public DateTime? AcceptedAt { get; set; }
        
        public DateTime? RejectedAt { get; set; }
        
        public InvitationStatus Status { get; set; }

        // Navigation properties
        [ForeignKey("GroupId")]
        public Group Group { get; set; }

        [ForeignKey("InvitedById")]
        public User InvitedBy { get; set; }

        [ForeignKey("InvitedUserId")]
        public User InvitedUser { get; set; }
    }

    public enum InvitationStatus
    {
        Pending,
        Accepted,
        Rejected,
        Expired
    }
}
