import './globals.css';

export const metadata = {
  title: 'CyberRoad — Feuille de route Cybersécurité',
  description: 'Suivi quotidien d\'apprentissage et de progression en cybersécurité (Jour X/365).',
};

/**
 * Root Layout principal pour l'application CyberRoad.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export default function RootLayout({ children }) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-cyber-bg text-gray-100 antialiased min-h-screen selection:bg-cyber-accent/20 selection:text-cyber-accent">
        {children}
      </body>
    </html>
  );
}
