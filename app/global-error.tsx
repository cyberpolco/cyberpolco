"use client";

export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", textAlign: "center", padding: "6rem 1.5rem" }}>
        <h1>Something went wrong</h1>
        <p>Please try again. If the problem persists, get in touch with us.</p>
        <button onClick={() => unstable_retry()}>Try again</button>
      </body>
    </html>
  );
}
