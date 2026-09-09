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

  /**
   * Export all vault expressions as a downloadable JSON file
   */
  exportVaultAsJson() {
    const jsonStr = JSON.stringify(this.vault, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kuroblob_vault_pack_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    return jsonStr;
  }

  /**
   * Import expressions from JSON string, merging with existing items
   */
  importVaultFromJson(jsonString) {
    try {
      const items = JSON.parse(jsonString);
      if (!Array.isArray(items)) throw new Error('Invalid vault JSON format: expected array');

      let importedCount = 0;
      items.forEach(item => {
        if (item && item.id) {
          this.vault = this.vault.filter(e => e.id !== item.id);
          this.vault.unshift(item);
          importedCount++;
        }
      });
      this.saveToStorage();
      return { success: true, count: importedCount };
    } catch (err) {
      console.error('Failed to import vault JSON:', err);
      return { success: false, error: err.message };
    }
  }
}
