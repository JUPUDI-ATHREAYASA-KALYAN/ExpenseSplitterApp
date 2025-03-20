using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullStackApp.Models
{
    public class GroupMember
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public DateTime JoinedAt { get; set; }

        // Optional - to track invitation status if needed
        public bool IsActive { get; set; }

        // Navigation properties
        [ForeignKey("GroupId")]
        public Group Group { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
