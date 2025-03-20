using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FullStackApp.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }

        [Required]
        public string PasswordHash { get; set; }

        public DateTime CreatedAt { get; set; }
        
        public DateTime UpdatedAt { get; set; }

        // Navigation properties
        public ICollection<GroupMember> GroupMemberships { get; set; }
        public ICollection<Group> CreatedGroups { get; set; }
        public ICollection<Expense> PaidExpenses { get; set; }
        public ICollection<ExpenseSplit> ExpenseSplits { get; set; }
    }
}
