import React from 'react';

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-lg dark:prose-invert">
                <p className="lead">Last updated: {new Date().toLocaleDateString()}</p>

                <h2>1. Agreement to Terms</h2>
                <p>
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and HealthMind AI ("we," "us," or "our"), concerning your access to and use of the HealthMind AI application.
                </p>

                <h2>2. Intellectual Property Rights</h2>
                <p>
                    Unless otherwise indicated, the application is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the application (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us.
                </p>

                <h2>3. User Representations</h2>
                <p>
                    By using the application, you represent and warrant that: (1) all registration information you submit will be true, accurate, current, and complete; (2) you will maintain the accuracy of such information and promptly update such registration information as necessary.
                </p>

                <h2>4. Disclaimer</h2>
                <p>
                    <strong>THE APPLICATION IS PROVIDED ON AN AS-IS AND AS-AVAILABLE BASIS. THE INFORMATION PROVIDED BY THIS APPLICATION IS FOR INFORMATIONAL PURPOSES ONLY AND DOES NOT CONSTITUTE PROFESSIONAL MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. ALWAYS SEEK THE ADVICE OF YOUR PHYSICIAN OR OTHER QUALIFIED HEALTH PROVIDER WITH ANY QUESTIONS YOU MAY HAVE REGARDING A MEDICAL CONDITION.</strong>
                </p>

                <h2>5. Contact Us</h2>
                <p>
                    If you have questions or comments about these terms, you may email us at support@healthmindai.com.
                </p>
            </div>
        </div>
    );
}
