import { render, screen } from '@testing-library/react';
import { Home } from '../ui';
import { ClerkProvider } from '@clerk/clerk-react';
import { env } from 'app/config';

describe('Home', () => {
  it('should render', () => {
    render(
      <ClerkProvider
        publishableKey={env.clerk.publishableKey}
        afterSignOutUrl="/"
      >
        <Home />
      </ClerkProvider>
    );
    const heading = screen.getByRole('heading', {
      name: /Welcome to Figma Clone/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
