using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullStackApp.Models
{
    public class Group
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string Description { get; set; }

        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }

        [Required]
        public Guid CreatedById { get; set; }

        [ForeignKey("CreatedById")]
        public User CreatedBy { get; set; }

        // Navigation properties
        public ICollection<GroupMember> Members { get; set; }
        public ICollection<Expense> Expenses { get; set; }
    }
}
