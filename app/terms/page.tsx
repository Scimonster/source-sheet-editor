export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-serif font-semibold mb-6">Terms of Service</h1>
      <div className="space-y-4 text-sm sm:text-base text-foreground/90">
        <p>
          This software is provided as-is, with no guarantees or warranties of any kind, including accuracy,
          reliability, or fitness for a particular purpose.
        </p>
        <p>
          You retain ownership of all content you create with this site. You are solely responsible for your
          content, and the site bears no responsibility for user-generated material.
        </p>
        <p>
          This site does not store your work remotely. Your sheets and other user-generated content are stored on
          your own device.
        </p>
        <p>
          Mekorly has no relation to Sefaria. Mekorly uses Sefaria&apos;s public API to retrieve source material.
        </p>
        <p>These Terms of Service may be updated at any time without notice.</p>
      </div>
    </main>
  );
}
