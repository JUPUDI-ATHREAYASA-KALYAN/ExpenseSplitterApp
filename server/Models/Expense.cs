using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullStackApp.Models
{
    public class Expense
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid GroupId { get; set; }

        [Required]
        public Guid PaidById { get; set; }

        [Required]
        [StringLength(200)]
        public string Description { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        public DateTime CreatedAt { get; set; }
        
        public bool IsSettled { get; set; }

        // Navigation properties
        [ForeignKey("GroupId")]
        public Group Group { get; set; }

        [ForeignKey("PaidById")]
        public User PaidBy { get; set; }

        public ICollection<ExpenseSplit> Splits { get; set; }
        public ICollection<Settlement> Settlements { get; set; }
    }
}
