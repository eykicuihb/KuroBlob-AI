/**
 * KuroBlob AI - Expression Vault & Custom Pack Manager
 * Manages user-created and AI-synthesized procedural expressions in LocalStorage.
 * Injects custom expression buttons with distinct styling into the manual testing bar.
 */

const STORAGE_KEY = 'kuroblob_custom_vault_v1';

export class ExpressionVault {
  constructor() {
    this.vault = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load expression vault from localStorage:', e);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vault));
    } catch (e) {
      console.warn('Failed to save expression vault to localStorage:', e);
    }
  }

  /**
   * Save an expression object (including drawAccessory string representation)
   */
  saveExpression(exp) {
    if (!exp || !exp.id) return false;

    // Convert function to string if present
    let drawAccessoryCode = null;
    if (typeof exp.drawAccessory === 'function') {
      const fnStr = exp.drawAccessory.toString();
      // Extract function body
      const match = fnStr.match(/\{([\s\S]*)\}/);
      drawAccessoryCode = match ? match[1].trim() : fnStr;
    } else if (typeof exp.drawAccessoryCode === 'string') {
      drawAccessoryCode = exp.drawAccessoryCode;
    }

    const item = {
      id: exp.id,
      nameZh: exp.nameZh || exp.id,
      nameEn: exp.nameEn || exp.id,
      emoji: exp.emoji || '🎨',
      body: exp.body || {},
      eyes: exp.eyes || {},
      rings: exp.rings || {},
      particles: exp.particles || {},
      drawAccessoryCode,
      createdAt: Date.now()
    };

    // Remove existing with same id if any
    this.vault = this.vault.filter(e => e.id !== item.id);
    this.vault.unshift(item); // Add to beginning
    this.saveToStorage();
    return true;
  }

  getAll() {
    return this.vault.map(item => {
      let drawAccessory = null;
      if (item.drawAccessoryCode) {
        try {
          drawAccessory = new Function('ctx', 't', item.drawAccessoryCode);
        } catch (e) {
          console.warn('Failed to compile vault drawAccessory:', e);
        }
      }
      return {
        ...item,
        drawAccessory
      };
    });
  }

  deleteExpression(id) {
    this.vault = this.vault.filter(e => e.id !== id);
    this.saveToStorage();
  }

  /**
   * Mount vault expressions into the testing grid container
   */
  renderToGrid(container, onSelect, onDelete) {
    if (!container) return;
    container.innerHTML = '';

    const list = this.getAll();
    if (list.length === 0) return;

    list.forEach(exp => {
      const btn = document.createElement('button');
      btn.className = 'btn-emotion btn-vault-custom';
      btn.dataset.emotion = exp.id;
      btn.title = `${exp.nameZh} / ${exp.nameEn} (点击测试)`;
      btn.style.borderColor = '#A855F7';
      btn.style.background = 'rgba(168, 85, 247, 0.12)';
      btn.innerHTML = `<span>${exp.emoji}</span> <span>${exp.nameZh}</span> <span class="badge-vault-del" title="删除" style="margin-left: 4px; opacity: 0.6; font-size: 0.7rem;">✕</span>`;

      btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('badge-vault-del')) {
          e.stopPropagation();
          this.deleteExpression(exp.id);
          this.renderToGrid(container, onSelect, onDelete);
          if (onDelete) onDelete(exp);
          return;
        }
        if (onSelect) onSelect(exp);
      });

      container.appendChild(btn);
    });
  }
}
