import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Top SEO Specialists directory.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight text-foreground">
        Terms of Service
      </h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="space-y-4">
          <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <p>
            Welcome to Top SEO Specialists! These terms and conditions outline the rules and regulations
            for the use of Top SEO Specialists&apos;s Website, located at topseospecialists.netlify.app.
          </p>
          <p>
            By accessing this website, we assume you accept these terms and conditions. Do not continue to
            use Top SEO Specialists if you do not agree to take all of the terms and conditions stated on
            this page.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Directory Submissions and Content</h2>
          <p>
            Top SEO Specialists is a curated directory. If you submit a specialist profile for inclusion:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>We reserve the right to review, approve, edit, or reject any submitted profiles at our sole discretion.</li>
            <li>You warrant that the information you provide is true, accurate, and not misleading.</li>
            <li>You grant us a non-exclusive license to display the submitted information, including names, public social media profiles, and website links, on our directory.</li>
            <li>We do not guarantee inclusion or a specific ranking/placement within the directory.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Usage Restrictions</h2>
          <p>You must not:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Republish material from Top SEO Specialists</li>
            <li>Sell, rent, or sub-license material from Top SEO Specialists</li>
            <li>Reproduce, duplicate, or copy material from Top SEO Specialists</li>
            <li>Redistribute content from Top SEO Specialists (unless content is specifically made for redistribution)</li>
            <li>Use the directory to scrape data, send spam, or extract contact information for unsolicited marketing.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Disclaimer of Warranties</h2>
          <p>
            The specialists listed in our directory are independent professionals. Top SEO Specialists serves
            solely as a discovery platform and does not employ these individuals or guarantee their
            services.
          </p>
          <p>
            To the maximum extent permitted by applicable law, we exclude all representations, warranties,
            and conditions relating to our website and the use of this website. We will not be liable for
            any loss or damage of any nature resulting from your decision to hire or engage with any
            specialist listed on this site.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Links to Other Websites</h2>
          <p>
            Our Service may contain links to third-party web sites or services that are not owned or
            controlled by Top SEO Specialists.
          </p>
          <p>
            Top SEO Specialists has no control over, and assumes no responsibility for, the content,
            privacy policies, or practices of any third party web sites or services. You further
            acknowledge and agree that Top SEO Specialists shall not be responsible or liable, directly or
            indirectly, for any damage or loss caused or alleged to be caused by or in connection with the
            use of or reliance on any such content, goods or services available on or through any such web
            sites or services.
          </p>
        </section>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a
            revision is material we will try to provide at least 30 days&apos; notice prior to any new terms
            taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>

        <section className="space-y-4 pt-4">
          <p>
            For information on how we handle user data and privacy, please review our{" "}
            <Link href="/privacy-policy" className="text-primary hover:underline font-medium">
              Privacy Policy
            </Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
