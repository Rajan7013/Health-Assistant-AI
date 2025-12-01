import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-lg dark:prose-invert">
                <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Introduction</h2>
                <p>
                    Welcome to HealthMind AI ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy.
                    If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact us.
                </p>

                <h2>2. Information We Collect</h2>
                <p>
                    We collect personal information that you voluntarily provide to us when you register on the application, express an interest in obtaining information about us or our products and services, when you participate in activities on the application, or otherwise when you contact us.
                </p>
                <ul>
                    <li><strong>Personal Information Provided by You:</strong> We collect names; email addresses; passwords; and other similar information.</li>
                    <li><strong>Health Data:</strong> We collect health-related data that you input, such as symptoms, medications, and medical reports, solely for the purpose of providing our services.</li>
                </ul>

                <h2>3. How We Use Your Information</h2>
                <p>
                    We use personal information collected via our application for a variety of business purposes described below:
                </p>
                <ul>
                    <li>To provide and manage your account.</li>
                    <li>To provide the AI-driven health analysis and recommendations.</li>
                    <li>To send you administrative information.</li>
                    <li>To protect our services.</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>
                    We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                </p>

                <h2>5. Contact Us</h2>
                <p>
                    If you have questions or comments about this policy, you may email us at support@healthmindai.com.
                </p>
            </div>
        </div>
    );
}
