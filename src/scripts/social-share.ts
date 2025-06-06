/**
 * Consolidated Social Share Script
 * Handles all sharing functionality with optimized loading
 */

interface ShareData {
  url: string;
  title: string;
  text?: string;
}

class SocialShareManager {
  private toastElement: HTMLElement | null = null;
  private initialized = false;

  constructor() {
    this.init();
  }

  private init(): void {
    if (this.initialized) return;
    
    // Initialize toast element
    this.toastElement = document.getElementById('copy-toast');
    
    // Bind event listeners
    this.bindCopyButtons();
    this.bindShareButtons();
    this.bindMessageCopy();
    
    this.initialized = true;
    console.log(' Social share manager initialized');
  }

  private bindCopyButtons(): void {
    const copyButtons = document.querySelectorAll('[data-action="copy"], .copy-link-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        
        const url = button.getAttribute('data-url') || window.location.href;
        await this.copyToClipboard(url);
      });
    });
  }

  private bindShareButtons(): void {
    const shareButtons = document.querySelectorAll('[data-action="share"]');
    
    shareButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        
        const url = button.getAttribute('data-url') || window.location.href;
        const title = button.getAttribute('data-title') || document.title;
        const platform = button.getAttribute('data-platform');
        
        if (platform) {
          this.shareToSocial(platform, { url, title });
        }
      });
    });
  }

  private bindMessageCopy(): void {
    const copyMessageButton = document.getElementById('copy-message');
    const messageTextarea = document.getElementById('share-message') as HTMLTextAreaElement;
    
    if (copyMessageButton && messageTextarea) {
      copyMessageButton.addEventListener('click', async () => {
        await this.copyToClipboard(messageTextarea.value, 'Mensaje copiado al portapapeles');
      });
    }
  }

  private async copyToClipboard(text: string, message = 'Enlace copiado al portapapeles'): Promise<void> {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      this.showToast(message);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showToast('Error al copiar');
    }
  }

  private shareToSocial(platform: string, data: ShareData): void {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${data.title} ${data.url}`)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`
    };

    const shareUrl = urls[platform];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
    }
  }

  private showToast(message: string): void {
    if (!this.toastElement) return;

    // Update message
    this.toastElement.innerHTML = `
      <svg class="w-4 h-4 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg> ${message}
    `;

    // Show toast
    this.toastElement.classList.remove('translate-y-full', 'opacity-0');
    this.toastElement.classList.add('translate-y-0', 'opacity-100');

    // Hide after 3 seconds
    setTimeout(() => {
      if (this.toastElement) {
        this.toastElement.classList.remove('translate-y-0', 'opacity-100');
        this.toastElement.classList.add('translate-y-full', 'opacity-0');
      }
    }, 3000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new SocialShareManager();
  });
} else {
  new SocialShareManager();
}

// Export for potential external use
(window as any).__socialShareManager = SocialShareManager;
