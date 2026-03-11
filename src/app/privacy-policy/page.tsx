import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Top SEO Specialists directory.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 md:px-8 py-12 lg:py-16 max-w-4xl">
      <h1 className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tight text-foreground">
        Privacy Policy
      </h1>
      
      <div className="space-y-8 text-muted-foreground leading-relaxed">
        <section className="space-y-4">
          <p>Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
          <p>
            At Top SEO Specialists, accessible from topseospecialists.netlify.app, one of our main priorities is
            the privacy of our visitors. This Privacy Policy document contains types of information that is
            collected and recorded by Top SEO Specialists and how we use it.
          </p>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not
            hesitate to contact us.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Information We Collect</h2>
          <p>
            The personal information that you are asked to provide, and the reasons why you are asked to
            provide it, will be made clear to you at the point we ask you to provide your personal
            information.
          </p>
          <p>
            If you contact us directly, we may receive additional information about you such as your name,
            email address, phone number, the contents of the message and/or attachments you may send us,
            and any other information you may choose to provide.
          </p>
          <h3 className="text-xl font-semibold text-foreground pt-2">Specialist Submissions</h3>
          <p>
            When you submit a specialist to be featured on our directory, we collect the information
            provided in the submission form. This includes the specialist&apos;s name, social media profiles,
            website, expertise areas, and any submitted photos. By submitting this information, you confirm
            that you have the right to share it for the purpose of public display on our directory.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">How We Use Your Information</h2>
          <p>We use the information we collect in various ways, including to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, operate, and maintain our website</li>
            <li>Improve, personalize, and expand our website</li>
            <li>Understand and analyze how you use our website</li>
            <li>Develop new products, services, features, and functionality</li>
            <li>Review, approve, and display submitted specialist profiles</li>
            <li>Find and prevent fraud</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Log Files and Analytics</h2>
          <p>
            Top SEO Specialists follows a standard procedure of using log files. These files log visitors
            when they visit websites. The information collected by log files includes internet protocol (IP) addresses,
            browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and
            possibly the number of clicks. These are not linked to any information that is personally
            identifiable. The purpose of the information is for analyzing trends, administering the site,
            tracking users&apos; movement on the website, and gathering demographic information.
          </p>
          <p>
            We also use third-party analytics services, specifically <strong>Google Analytics</strong> and{" "}
            <strong>Bing Analytics</strong>, to measure user interaction and improve our user experience.
            These tools use their own tracking technologies to gather aggregated data about site traffic and
            engagement. Additionally, we use <strong>Google Search Console</strong> and{" "}
            <strong>Bing Webmaster Tools</strong> to monitor our website&apos;s visibility within search
            engines. These tools provide us with search performance data without collecting personally
            identifiable information.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Third-Party Privacy Policies</h2>
          <p>
            Top SEO Specialists&apos;s Privacy Policy does not apply to other advertisers or websites. Thus, we
            are advising you to consult the respective Privacy Policies of these third-party ad servers
            for more detailed information. It may include their practices and instructions about how to
            opt-out of certain options.
          </p>
          <p>
            You can choose to disable cookies through your individual browser options. To know more detailed
            information about cookie management with specific web browsers, it can be found at the browsers&apos;
            respective websites.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Children&apos;s Information</h2>
          <p>
            Another part of our priority is adding protection for children while using the internet. We
            encourage parents and guardians to observe, participate in, and/or monitor and guide their
            online activity.
          </p>
          <p>
            Top SEO Specialists does not knowingly collect any Personal Identifiable Information from children
            under the age of 13. If you think that your child provided this kind of information on our
            website, we strongly encourage you to contact us immediately and we will do our best efforts to
            promptly remove such information from our records.
          </p>
        </section>
      </div>
    </div>
  );
}
