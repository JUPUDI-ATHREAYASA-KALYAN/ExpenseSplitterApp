using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullStackApp.Models
{
    public class ExpenseSplit
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ExpenseId { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public bool IsPaid { get; set; }

        // Navigation properties
        [ForeignKey("ExpenseId")]
        public Expense Expense { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
