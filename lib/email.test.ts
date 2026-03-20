import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  sendVerificationEmail,
  sendCommentNotificationEmail,
  sendGroupStatusEmail,
  sendJoinRequestStatusEmail,
} from './email';

// Helper to mock fetch and capture outgoing Brevo API calls
function setupFetchMock() {
  const calls: Array<{ subject: string; html: string }> = [];
  const mockFetch = vi.fn(async (_url: string, opts: RequestInit) => {
    const body = JSON.parse(opts.body as string);
    calls.push({ subject: body.subject, html: body.htmlContent });
    return { ok: true } as Response;
  });
  vi.stubGlobal('fetch', mockFetch);
  // Also stub BREVO_API_KEY so send() does not short-circuit
  vi.stubEnv('BREVO_API_KEY', 'test-api-key');
  return calls;
}

describe('Email HTML escaping', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sendVerificationEmail: escapes <script> in name', async () => {
    const calls = setupFetchMock();
    await sendVerificationEmail('a@b.com', '<script>alert(1)</script>', 'tok');
    expect(calls).toHaveLength(1);
    const { html } = calls[0];
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).not.toContain('<script>alert(1)</script>');
  });

  it('sendCommentNotificationEmail: escapes <b> tag in authorName and quotes in prayerTitle', async () => {
    const calls = setupFetchMock();
    await sendCommentNotificationEmail(
      'a@b.com',
      '<b>Evil</b>',
      'Commenter',
      '"XSS"',
      'id1'
    );
    expect(calls).toHaveLength(1);
    const { html } = calls[0];
    expect(html).toContain('&lt;b&gt;Evil&lt;/b&gt;');
    expect(html).toContain('&quot;XSS&quot;');
    expect(html).not.toContain('<b>Evil</b>');
  });

  it('sendCommentNotificationEmail: escapes <img> onerror in prayerTitle', async () => {
    const calls = setupFetchMock();
    await sendCommentNotificationEmail(
      'a@b.com',
      'Author',
      'Commenter',
      '<img src=x onerror=alert(1)>',
      'id1'
    );
    expect(calls).toHaveLength(1);
    const { html } = calls[0];
    expect(html).toContain('&lt;img');
    expect(html).not.toContain('<img src=x');
  });

  it('sendGroupStatusEmail: does NOT escape groupName in subject (plain text), DOES escape in HTML body', async () => {
    const calls = setupFetchMock();
    await sendGroupStatusEmail('a@b.com', 'Tom & Jerry', 'Group<br>Name', true);
    expect(calls).toHaveLength(1);
    const { subject, html } = calls[0];
    // Subject must contain raw value (not escaped)
    expect(subject).toContain('Group<br>Name');
    expect(subject).not.toContain('&lt;br&gt;');
    // HTML body must contain escaped values
    expect(html).toContain('&lt;br&gt;Name');
    expect(html).toContain('Tom &amp; Jerry');
    expect(html).not.toContain('Tom & Jerry');
  });

  it('sendJoinRequestStatusEmail: escapes single quotes and double quotes in name and groupName in HTML', async () => {
    const calls = setupFetchMock();
    await sendJoinRequestStatusEmail('a@b.com', "O'Brien", 'Group "Test"', true);
    expect(calls).toHaveLength(1);
    const { html } = calls[0];
    // Single quote encoded as &#39; by html-escaper
    expect(html).toMatch(/O(&#39;|&apos;)Brien/);
    expect(html).not.toContain("O'Brien");
    expect(html).toContain('&quot;Test&quot;');
    expect(html).not.toContain('"Test"');
  });

  it('btn() href values are NOT escaped — URLs remain functional', async () => {
    const calls = setupFetchMock();
    await sendVerificationEmail('a@b.com', 'Alice', 'mytoken123');
    expect(calls).toHaveLength(1);
    const { html } = calls[0];
    // href should contain raw URL, no &amp; substitutions
    const hrefMatch = html.match(/href="([^"]+)"/);
    expect(hrefMatch).not.toBeNull();
    const href = hrefMatch![1];
    expect(href).not.toContain('&amp;');
    expect(href).toContain('mytoken123');
  });
});
