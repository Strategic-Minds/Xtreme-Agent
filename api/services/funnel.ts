import { logger } from '../utils/logger.js';

export interface FunnelStep {
  id: string;
  title: string;
  type: 'form' | 'landing' | 'checkout' | 'thank-you';
  fields?: Array<{ name: string; type: string; required: boolean }>;
  content?: string;
}

export interface FunnelTemplate {
  name: string;
  description: string;
  steps: FunnelStep[];
}

/**
 * Generate a sales funnel based on user description
 */
export function generateFunnel(description: string): FunnelTemplate {
  logger.info(`Generating funnel: ${description}`);

  // Determine funnel type from description
  const isSaaS = description.toLowerCase().includes('saas');
  const isEcommerce = description.toLowerCase().includes('ecommerce') || description.toLowerCase().includes('product');
  const isLead = description.toLowerCase().includes('lead') || description.toLowerCase().includes('email');

  if (isSaaS) {
    return generateSaasFunnel();
  } else if (isEcommerce) {
    return generateEcommerceFunnel();
  } else if (isLead) {
    return generateLeadFunnel();
  } else {
    return generateGenericFunnel();
  }
}

function generateSaasFunnel(): FunnelTemplate {
  return {
    name: 'SaaS Sales Funnel',
    description: 'A complete funnel for SaaS product sales',
    steps: [
      {
        id: 'landing',
        title: 'Landing Page',
        type: 'landing',
        content: `
          <div class="hero">
            <h1>Transform Your Workflow</h1>
            <p>The all-in-one platform for modern teams</p>
            <button class="cta">Start Free Trial</button>
          </div>
          <div class="features">
            <div class="feature">
              <h3>🚀 Fast</h3>
              <p>Lightning-quick performance</p>
            </div>
            <div class="feature">
              <h3>🔒 Secure</h3>
              <p>Enterprise-grade security</p>
            </div>
            <div class="feature">
              <h3>📊 Powerful</h3>
              <p>Advanced analytics and insights</p>
            </div>
          </div>
        `,
      },
      {
        id: 'signup',
        title: 'Sign Up',
        type: 'form',
        fields: [
          { name: 'email', type: 'email', required: true },
          { name: 'company', type: 'text', required: true },
          { name: 'team_size', type: 'select', required: true },
        ],
      },
      {
        id: 'onboarding',
        title: 'Onboarding',
        type: 'form',
        fields: [
          { name: 'use_case', type: 'text', required: true },
          { name: 'budget', type: 'select', required: false },
        ],
      },
      {
        id: 'thank-you',
        title: 'Thank You',
        type: 'thank-you',
        content: `
          <div class="success">
            <h2>Welcome aboard! 🎉</h2>
            <p>Check your email for next steps</p>
          </div>
        `,
      },
    ],
  };
}

function generateEcommerceFunnel(): FunnelTemplate {
  return {
    name: 'Ecommerce Sales Funnel',
    description: 'Complete funnel for product sales',
    steps: [
      {
        id: 'product',
        title: 'Product Page',
        type: 'landing',
        content: `
          <div class="product">
            <img src="product.jpg" alt="Product">
            <h1>Premium Product</h1>
            <p class="price">$99.99</p>
            <button class="add-to-cart">Add to Cart</button>
          </div>
        `,
      },
      {
        id: 'checkout',
        title: 'Checkout',
        type: 'checkout',
        fields: [
          { name: 'name', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'address', type: 'text', required: true },
          { name: 'card', type: 'text', required: true },
        ],
      },
      {
        id: 'confirmation',
        title: 'Order Confirmation',
        type: 'thank-you',
        content: `
          <div class="confirmation">
            <h2>Order Confirmed! ✓</h2>
            <p>Your order has been received</p>
            <p>Tracking: #ORDER123</p>
          </div>
        `,
      },
    ],
  };
}

function generateLeadFunnel(): FunnelTemplate {
  return {
    name: 'Lead Capture Funnel',
    description: 'Funnel for capturing leads',
    steps: [
      {
        id: 'lead-magnet',
        title: 'Lead Magnet',
        type: 'landing',
        content: `
          <div class="lead-magnet">
            <h1>Get Your Free Guide</h1>
            <p>Learn the secrets to success</p>
            <button class="download">Download Now</button>
          </div>
        `,
      },
      {
        id: 'lead-form',
        title: 'Lead Form',
        type: 'form',
        fields: [
          { name: 'first_name', type: 'text', required: true },
          { name: 'email', type: 'email', required: true },
          { name: 'phone', type: 'tel', required: false },
        ],
      },
      {
        id: 'thank-you',
        title: 'Thank You',
        type: 'thank-you',
        content: `
          <div class="thank-you">
            <h2>Check Your Email!</h2>
            <p>Your guide is on the way</p>
          </div>
        `,
      },
    ],
  };
}

function generateGenericFunnel(): FunnelTemplate {
  return {
    name: 'Generic Funnel',
    description: 'A basic multi-step funnel',
    steps: [
      {
        id: 'step1',
        title: 'Step 1',
        type: 'landing',
        content: '<h1>Welcome</h1><p>This is step 1 of your funnel</p>',
      },
      {
        id: 'step2',
        title: 'Step 2',
        type: 'form',
        fields: [{ name: 'email', type: 'email', required: true }],
      },
      {
        id: 'step3',
        title: 'Complete',
        type: 'thank-you',
        content: '<h2>Success!</h2><p>You have completed the funnel</p>',
      },
    ],
  };
}

/**
 * Convert funnel to HTML
 */
export function funnelToHTML(funnel: FunnelTemplate): string {
  const steps = funnel.steps.map((step, index) => {
    let html = `<div class="funnel-step" id="step-${index}" style="display: ${index === 0 ? 'block' : 'none'}">`;

    if (step.type === 'form') {
      html += `<h2>${step.title}</h2><form>`;
      step.fields?.forEach((field) => {
        html += `
          <div class="form-group">
            <label>${field.name}</label>
            <input type="${field.type}" name="${field.name}" required="${field.required}">
          </div>
        `;
      });
      html += `<button type="submit" onclick="nextStep(${index + 1})">Next</button></form>`;
    } else {
      html += step.content || '';
    }

    html += '</div>';
    return html;
  }).join('');

  return `
    <div class="funnel-container">
      <div class="progress-bar">
        ${funnel.steps.map((_, i) => `<div class="progress-step" id="progress-${i}"></div>`).join('')}
      </div>
      ${steps}
    </div>
    <script>
      function nextStep(n) {
        document.querySelectorAll('.funnel-step').forEach(s => s.style.display = 'none');
        document.getElementById('step-' + n).style.display = 'block';
        document.querySelectorAll('.progress-step').forEach((s, i) => {
          s.classList.toggle('active', i < n);
        });
      }
    </script>
  `;
}
