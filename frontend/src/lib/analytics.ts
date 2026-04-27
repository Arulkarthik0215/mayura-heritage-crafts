export const initAnalytics = () => {
  // Only run in production environments
  if (!import.meta.env.PROD) {
    console.log("Analytics disabled in development mode.");
    return;
  }

  const GA_MEASUREMENT_ID = "G-CCNHF8TR7Z";

  // Load the gtag script
  const script1 = document.createElement("script");
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Initialize dataLayer and gtag
  const script2 = document.createElement("script");
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_MEASUREMENT_ID}');
  `;
  document.head.appendChild(script2);
};
