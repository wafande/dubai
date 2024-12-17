import { User, UserProfile } from '../types/user';
import { bookingService } from './bookingService';
import { reviewService } from './reviewService';

class UserService {
  private storageKey = 'dubai_charter_users';

  private getUsers(): User[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }

  private saveUsers(users: User[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(users));
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) return null;

    const [bookings, reviews] = await Promise.all([
      bookingService.getBookingsByUser(user.email),
      reviewService.getReviewsByUser(userId),
    ]);

    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.date) > now);
    const completedBookings = bookings.filter(b => new Date(b.date) <= now);

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    return {
      ...user,
      bookings: {
        total: bookings.length,
        upcoming: upcomingBookings.length,
        completed: completedBookings.length,
      },
      reviews: {
        total: reviews.length,
        averageRating,
      },
    };
  }

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      ...updates,
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);

    return updatedUser;
  }

  async updateUserPreferences(
    userId: string,
    preferences: User['preferences']
  ): Promise<User> {
    return this.updateUserProfile(userId, { preferences });
  }

  async updateUserAvatar(userId: string, avatar: string): Promise<User> {
    return this.updateUserProfile(userId, { avatar });
  }

  async toggleFavoriteDestination(
    userId: string,
    destinationId: string
  ): Promise<string[]> {
    const user = await this.getUserProfile(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const favorites = user.favoriteDestinations || [];
    const updatedFavorites = favorites.includes(destinationId)
      ? favorites.filter(id => id !== destinationId)
      : [...favorites, destinationId];

    await this.updateUserProfile(userId, {
      favoriteDestinations: updatedFavorites,
    });

    return updatedFavorites;
  }
}

export const userService = new UserService(); 