import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { NodeNetworkFallback } from './NodeNetworkFallback';

describe('NodeNetworkFallback', () => {
  it('renders a canvas element and unmounts cleanly', () => {
    const { container, unmount } = render(<NodeNetworkFallback />);
    expect(container.querySelector('canvas')).toBeInTheDocument();
    unmount();
  });
});
