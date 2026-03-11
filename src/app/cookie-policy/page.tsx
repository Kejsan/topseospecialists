import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Top SEO Specialists directory.",
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight text-foreground">
        Cookie Policy
      </h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="space-y-4">
          <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <p>
            This Cookie Policy explains what cookies are and how we use them. You should read this policy
            so you can understand what type of cookies we use, or the information we collect using cookies
            and how that information is used. This Cookie Policy was created for Top SEO Specialists.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">What Are Cookies</h2>
          <p>
            Cookies are small files that are placed on your computer, mobile device, or any other device
            by a website, containing the details of your browsing history on that website among its many
            uses. Cookies do not typically contain any information that personally identifies a user, but
            personal information that we store about You may be linked to the information stored in and
            obtained from cookies.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">How We Use Cookies</h2>
          <p>We use cookies for the following purposes:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Essential Cookies:</strong> These cookies are necessary to provide you with services
              available through our website and to use some of its features. Without these cookies, the
              services that you have asked for cannot be provided.
            </li>
            <li>
              <strong>Analytics Cookies:</strong> We use tools like <strong>Google Analytics</strong> and{" "}
              <strong>Bing Analytics</strong> to understand how visitors interact with our website, track
              popular content, and measure site usage. These cookies gather information without personally
              identifying individual users, helping us improve the overall site experience and search
              visibility.
            </li>
            <li>
              <strong>Functionality Cookies:</strong> These cookies allow us to remember choices you make
              when you use the website, such as remembering your preferences or display settings.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Managing Cookies</h2>
          <p>
            If you prefer to avoid the use of cookies on the website, first you must disable the use of
            cookies in your browser and then delete the cookies saved in your browser associated with this
            website. You may use this option for preventing the use of cookies at any time.
          </p>
          <p>
            If you do not accept our cookies, you may experience some inconvenience in your use of the
            website and some features may not function properly.
          </p>
          <p>
            If you&apos;d like to delete cookies or instruct your web browser to delete or refuse cookies,
            please visit the help pages of your web browser:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>For Chrome, please visit: <a href="https://support.google.com/accounts/answer/32050" className="text-primary hover:underline" target="_blank" rel="noreferrer">Google Chrome Help</a></li>
            <li>For Safari, please visit: <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" className="text-primary hover:underline" target="_blank" rel="noreferrer">Apple Safari Help</a></li>
            <li>For Firefox, please visit: <a href="https://support.mozilla.org/en-US/kb/clear-cookies-and-site-data-firefox" className="text-primary hover:underline" target="_blank" rel="noreferrer">Mozilla Firefox Help</a></li>
            <li>For all other web browsers, please visit your web browser&apos;s official web pages.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
          <p>
            If you have any questions about this Cookie Policy, You can contact us through the regular
            channels provided on our website.
          </p>
        </section>
      </div>
    </div>
  );
}
