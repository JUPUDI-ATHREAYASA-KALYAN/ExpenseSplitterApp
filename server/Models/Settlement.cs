using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FullStackApp.Models
{
    public class Settlement
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public Guid ExpenseId { get; set; }

        [Required]
        public Guid PayerId { get; set; }

        [Required]
        public Guid PayeeId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime Date { get; set; }

        [StringLength(50)]
        public string Method { get; set; }

        [StringLength(500)]
        public string Notes { get; set; }

        public DateTime CreatedAt { get; set; }

        // Navigation properties
        [ForeignKey("ExpenseId")]
        public Expense Expense { get; set; }

        [ForeignKey("PayerId")]
        public User Payer { get; set; }

        [ForeignKey("PayeeId")]
        public User Payee { get; set; }
    }
}
