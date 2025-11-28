import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="1em"
      height="1em"
      {...props}
    >
      <path fill="none" d="M0 0h256v256H0z" />
      <path
        fill="currentColor"
        d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm48 112h-40v40a8 8 0 0 1-16 0v-40H80a8 8 0 0 1 0-16h40V80a8 8 0 0 1 16 0v40h40a8 8 0 0 1 0 16Z"
      />
    </svg>
  );
}
