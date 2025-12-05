export default function Head() {
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-17782747987";
  return (
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      {/* Google tag (gtag.js) */}
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}></script>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);} 
            gtag('js', new Date());
            gtag('config', '${adsId}', { send_page_view: true });
          `,
        }}
      />
    </>
  );
}
