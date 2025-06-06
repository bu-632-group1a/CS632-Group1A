import React from 'react';
import { render, screen } from '@testing-library/react';
import LeaderboardItem from '../../../components/leaderboard/LeaderboardItem';

const mockEntry = {
  userId: 'test-user',
  totalActions: 10,
  totalImpact: 500,
  averageImpact: 50,
  rank: 4
};

describe('LeaderboardItem', () => {
  it('renders user information correctly', () => {
    render(<LeaderboardItem entry={mockEntry} isCurrentUser={false} />);
    
    expect(screen.getByText('User test-user')).toBeInTheDocument();
    expect(screen.getByText('10 actions')).toBeInTheDocument();
    expect(screen.getByText('50.0 avg impact')).toBeInTheDocument();
    expect(screen.getByText('500 pts')).toBeInTheDocument();
  });

  it('shows "You" badge when isCurrentUser is true', () => {
    render(<LeaderboardItem entry={mockEntry} isCurrentUser={true} />);
    expect(screen.getByText('You')).toBeInTheDocument();
  });

  it('displays trophy icon for top 3 ranks', () => {
    const topEntry = { ...mockEntry, rank: 1 };
    const { container } = render(<LeaderboardItem entry={topEntry} isCurrentUser={false} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('displays numeric rank for positions below top 3', () => {
    render(<LeaderboardItem entry={mockEntry} isCurrentUser={false} />);
    expect(screen.getByText('4')).toBeInTheDocument();
  });
});