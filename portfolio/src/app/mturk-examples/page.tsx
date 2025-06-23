import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Brain,
  Code,
  Target,
  Shield,
  Users,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Amazon MTurk AI Evaluation Work | Lawrence Hua",
  description:
    "Learn about Lawrence's work as an External Expert – AI Model Evaluation for Amazon's Mechanical Turk Experts Program, evaluating and improving AI-generated code and natural language responses.",
  keywords:
    "Lawrence Hua, Amazon MTurk, AI evaluation, prompt engineering, machine learning, AI alignment",
};

export default function MTurkExamplesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </div>
      </nav>

      {/* Header */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-full px-6 py-3">
            <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              Amazon MTurk Experts Program
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            AI Evaluation &{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Alignment Work
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Contributing human expertise to train and refine the next generation
            of responsible, high-precision AI systems
          </p>

          <div className="flex flex-wrap gap-3 justify-center mb-8">
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
              AI Evaluation
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
              Prompt Engineering
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
              Human-AI Alignment
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-full text-sm font-medium">
              Code Quality Assessment
            </span>
          </div>
        </div>
      </section>

      {/* Role Overview */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 mb-12">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
              Role Overview
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Position
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  External Expert – AI Model Evaluation at Amazon Mechanical
                  Turk Experts Program
                </p>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Qualification Rating
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-3 py-1 rounded-full text-sm font-medium">
                    Expert
                  </span>
                </p>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Duration
                </h3>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  June 2025 - Present
                </p>

                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Focus Area
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  AGI model development, AI safety, and human-AI alignment
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  Mission
                </h3>
                <p className="text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                  "Contributing human expertise to train and refine the next
                  generation of responsible, high-precision AI systems."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Work Categories */}
      <section className="py-16 px-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Types of Problems I Solve
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* AI Code Evaluation */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  AI Code Evaluation
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Evaluating and improving AI-generated code for reliability,
                accuracy, and best practices.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>• Code quality assessment</li>
                <li>• Algorithm optimization review</li>
                <li>• Security vulnerability detection</li>
                <li>• Performance analysis</li>
              </ul>
            </div>

            {/* Natural Language Processing */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Prompt Assessment
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                High-impact prompt assessments to enhance large language model
                performance.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>• Prompt effectiveness evaluation</li>
                <li>• Response quality scoring</li>
                <li>• Context understanding assessment</li>
                <li>• Output coherence analysis</li>
              </ul>
            </div>

            {/* Human-AI Alignment */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Human-AI Comparison
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Structured comparison tasks between human and AI-generated
                outputs.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>• Quality differential analysis</li>
                <li>• Human preference modeling</li>
                <li>• Bias detection and mitigation</li>
                <li>• Alignment measurement</li>
              </ul>
            </div>

            {/* Ethical AI */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  AI Safety & Ethics
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Ensuring AI systems are safer, more ethical, and better aligned
                with human values.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>• Ethical alignment evaluation</li>
                <li>• Safety boundary testing</li>
                <li>• Harm prevention assessment</li>
                <li>• Value alignment scoring</li>
              </ul>
            </div>

            {/* User Experience */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                  <Brain className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  UX Quality Assessment
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Applying human judgment and product sense to assess user
                experience quality.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>• User experience evaluation</li>
                <li>• Interaction design review</li>
                <li>• Usability assessment</li>
                <li>• Product intuition application</li>
              </ul>
            </div>

            {/* Model Refinement */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Model Behavior Feedback
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Providing expert feedback to support safer, more human-aligned
                AI development.
              </p>
              <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-2">
                <li>• Behavioral pattern analysis</li>
                <li>• Performance optimization input</li>
                <li>• Training data quality review</li>
                <li>• Model accuracy enhancement</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Impact & Approach */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            My Approach & Impact
          </h2>

          <div className="space-y-8">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl p-8 border border-blue-200 dark:border-blue-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Human-Centered AI Development
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Leveraging my product management background and technical
                expertise to bridge the gap between human expectations and AI
                capabilities. I bring a unique perspective that combines
                technical understanding with user experience intuition.
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/10 dark:to-blue-900/10 rounded-xl p-8 border border-green-200 dark:border-green-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Quality & Safety Focus
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Every evaluation I perform considers not just technical
                accuracy, but also real-world applicability, ethical
                implications, and potential risks. This comprehensive approach
                helps ensure AI systems are both powerful and responsible.
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl p-8 border border-purple-200 dark:border-purple-800">
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Continuous Learning & Adaptation
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                As AI technology rapidly evolves, I continuously adapt my
                evaluation criteria and methodologies to stay current with best
                practices and emerging challenges in AI safety and alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-6">
            Interested in AI Evaluation & Alignment Work?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Let's discuss how human expertise can enhance AI development in your
            organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/#contact"
              className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get in Touch
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              View Full Portfolio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
