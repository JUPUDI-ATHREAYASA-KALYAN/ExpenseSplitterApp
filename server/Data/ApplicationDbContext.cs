using Microsoft.EntityFrameworkCore;
using FullStackApp.Models;
using System;

namespace FullStackApp.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<GroupInvitation> GroupInvitations { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<ExpenseSplit> ExpenseSplits { get; set; }
        public DbSet<Settlement> Settlements { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Group configuration
            modelBuilder.Entity<Group>()
                .HasOne(g => g.CreatedBy)
                .WithMany(u => u.CreatedGroups)
                .HasForeignKey(g => g.CreatedById)
                .OnDelete(DeleteBehavior.Restrict);

            // GroupMember configuration
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.Group)
                .WithMany(g => g.Members)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupMemberships)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Expense configuration
            modelBuilder.Entity<Expense>()
                .HasOne(e => e.Group)
                .WithMany(g => g.Expenses)
                .HasForeignKey(e => e.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Expense>()
                .HasOne(e => e.PaidBy)
                .WithMany(u => u.PaidExpenses)
                .HasForeignKey(e => e.PaidById)
                .OnDelete(DeleteBehavior.Restrict);

            // ExpenseSplit configuration
            modelBuilder.Entity<ExpenseSplit>()
                .HasOne(es => es.Expense)
                .WithMany(e => e.Splits)
                .HasForeignKey(es => es.ExpenseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ExpenseSplit>()
                .HasOne(es => es.User)
                .WithMany(u => u.ExpenseSplits)
                .HasForeignKey(es => es.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Settlement configuration
            modelBuilder.Entity<Settlement>()
                .HasOne(s => s.Expense)
                .WithMany(e => e.Settlements)
                .HasForeignKey(s => s.ExpenseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Settlement>()
                .HasOne(s => s.Payer)
                .WithMany()
                .HasForeignKey(s => s.PayerId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Settlement>()
                .HasOne(s => s.Payee)
                .WithMany()
                .HasForeignKey(s => s.PayeeId)
                .OnDelete(DeleteBehavior.Restrict);

            // GroupInvitation configuration
            modelBuilder.Entity<GroupInvitation>()
                .HasOne(gi => gi.Group)
                .WithMany()
                .HasForeignKey(gi => gi.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupInvitation>()
                .HasOne(gi => gi.InvitedBy)
                .WithMany()
                .HasForeignKey(gi => gi.InvitedById)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<GroupInvitation>()
                .HasOne(gi => gi.InvitedUser)
                .WithMany()
                .HasForeignKey(gi => gi.InvitedUserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
