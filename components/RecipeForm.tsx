import React, { useState, useRef } from 'react';
import { Camera, Plus, X, Clock, Trash2, Loader2 } from 'lucide-react';
import { Recipe, Category, Ingredient, Step } from '../types';
import { compressImage, needsCompression, getImageSizeKB } from '../utils/imageCompress';
import { useLanguage } from '../contexts/LanguageContext';

interface RecipeFormProps {
  initialRecipe?: Recipe | null;
  onSave: (recipe: Omit<Recipe, 'id' | 'createdAt'> & { id?: string; createdAt?: number }) => void;
  onCancel: () => void;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({ initialRecipe, onSave, onCancel }) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState(initialRecipe?.title || '');
  const [description, setDescription] = useState(initialRecipe?.description || '');
  const [category, setCategory] = useState<Category>(initialRecipe?.category || Category.BREAKFAST);
  const [image, setImage] = useState<string>(initialRecipe?.image || '');
  const [prepTime, setPrepTime] = useState(initialRecipe?.prepTime || '');
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [ingredients, setIngredients] = useState<Ingredient[]>(
    initialRecipe?.ingredients || [{ id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '' }]
  );
  
  const [steps, setSteps] = useState<Step[]>(
    initialRecipe?.steps || [{ id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '' }]
  );

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      alert(t('errors.imageCompressFailed'));
      return;
    }

    // 如果图片需要压缩（大于 800KB），进行高质量压缩
    if (needsCompression(file, 800)) {
      setIsCompressing(true);
      try {
        const originalSizeKB = getImageSizeKB(file);
        console.log(`原始图片大小: ${originalSizeKB.toFixed(2)} KB，开始高质量压缩...`);
        
        const compressedImage = await compressImage(file, {
          maxWidth: 1920,      // 提高分辨率限制
          maxHeight: 1920,
          quality: 0.95,       // 高质量（接近无损）
          maxSizeKB: 800,      // 提高大小限制
          preserveFormat: true, // 保持原始格式
          lossless: false      // 使用有损但高质量压缩
        });
        
        const compressedSizeKB = (compressedImage.length * 3) / 4 / 1024;
        const compressionRatio = ((1 - compressedSizeKB / originalSizeKB) * 100).toFixed(1);
        console.log(`压缩后大小: ${compressedSizeKB.toFixed(2)} KB (压缩率: ${compressionRatio}%)`);
        
        setImage(compressedImage);
      } catch (error) {
        console.error('图片压缩失败:', error);
        alert(t('errors.imageCompressFailed'));
        // 如果压缩失败，仍然尝试使用原图（但可能会超出存储限制）
        const reader = new FileReader();
        reader.onloadend = () => {
          setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsCompressing(false);
      }
    } else {
      // 图片较小，直接使用（不压缩）
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddIngredient = () => {
    setIngredients([...ingredients, { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '' }]);
  };

  const handleIngredientChange = (id: string, text: string) => {
    setIngredients(ingredients.map(i => i.id === id ? { ...i, text } : i));
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter(i => i.id !== id));
    }
  };

  const handleAddStep = () => {
    setSteps([...steps, { id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, text: '' }]);
  };

  const handleStepChange = (id: string, text: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, text } : s));
  };

  const removeStep = (id: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!title.trim()) {
      // 使用更好的错误提示方式
      const titleInput = document.querySelector('input[placeholder="Recipe Title"]') as HTMLInputElement;
      if (titleInput) {
        titleInput.focus();
        titleInput.style.borderBottomColor = '#ef4444';
        setTimeout(() => {
          titleInput.style.borderBottomColor = '';
        }, 2000);
      }
      return;
    }
    
    const filteredIngredients = ingredients.filter(i => i.text.trim() !== '');
    const filteredSteps = steps.filter(s => s.text.trim() !== '');
    
    // 验证至少有一个ingredient和step
    if (filteredIngredients.length === 0) {
      const firstIngredientInput = document.querySelector('input[placeholder="Add ingredient"]') as HTMLInputElement;
      if (firstIngredientInput) {
        firstIngredientInput.focus();
      }
      return;
    }
    
    if (filteredSteps.length === 0) {
      const firstStepTextarea = document.querySelector('textarea[placeholder="Describe this step..."]') as HTMLTextAreaElement;
      if (firstStepTextarea) {
        firstStepTextarea.focus();
      }
      return;
    }
    
    onSave({
      ...(initialRecipe ? { id: initialRecipe.id, createdAt: initialRecipe.createdAt } : {}),
      title,
      description,
      category,
      image: image || 'https://picsum.photos/800/600?random=99',
      prepTime: prepTime || '15 min',
      ingredients: filteredIngredients,
      steps: filteredSteps
    });
  };

  return (
    <div className="pb-24 bg-morandi-bg min-h-full">
      {/* Image Upload Section */}
      <div 
        className="relative w-full h-64 bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer group"
        onClick={() => !isCompressing && fileInputRef.current?.click()}
      >
        {isCompressing ? (
          <div className="flex flex-col items-center text-morandi-primary">
            <Loader2 size={48} className="mb-2 opacity-50 animate-spin" />
            <span className="text-sm font-medium opacity-70">{t('recipeForm.compressing')}</span>
          </div>
        ) : image ? (
          <img src={image} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center text-morandi-primary">
            <Camera size={48} className="mb-2 opacity-50" />
            <span className="text-sm font-medium opacity-70">{t('recipeForm.addCoverPhoto')}</span>
          </div>
        )}
        {!isCompressing && (
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
        )}
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*" 
          className="hidden" 
          onChange={handleImageUpload}
          disabled={isCompressing}
        />
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-morandi-surface rounded-t-3xl shadow-lg p-6 space-y-6">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <input
              type="text"
              placeholder={t('recipeForm.recipeTitle')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-serif font-bold text-morandi-text placeholder-gray-300 border-b border-transparent focus:border-morandi-primary focus:outline-none bg-transparent transition-all"
            />
            
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-morandi-subtext uppercase mb-1 tracking-wider">{t('recipeForm.category')}</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full p-2 rounded-lg bg-morandi-bg text-morandi-text text-sm border-none focus:ring-1 focus:ring-morandi-primary outline-none"
                >
                  {Object.values(Category).filter(c => c !== 'All').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-morandi-subtext uppercase mb-1 tracking-wider">{t('recipeForm.time')}</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-2.5 top-2.5 text-morandi-accent" />
                  <input 
                    type="text" 
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder={t('recipeForm.timePlaceholder')}
                    className="w-full p-2 pl-9 rounded-lg bg-morandi-bg text-morandi-text text-sm border-none focus:ring-1 focus:ring-morandi-primary outline-none"
                  />
                </div>
              </div>
            </div>

            <textarea
              placeholder={t('recipeForm.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg bg-morandi-bg text-morandi-text text-sm resize-none focus:ring-1 focus:ring-morandi-primary outline-none"
            />
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-lg font-semibold text-morandi-text mb-3">{t('recipeForm.ingredients')}</h3>
            <div className="space-y-2">
              {ingredients.map((ing) => (
                <div key={ing.id} className="flex gap-2 items-center animate-fade-in">
                  <div className="w-1.5 h-1.5 rounded-full bg-morandi-secondary flex-shrink-0" />
                  <input
                    type="text"
                    value={ing.text}
                    onChange={(e) => handleIngredientChange(ing.id, e.target.value)}
                    placeholder={t('recipeForm.ingredientPlaceholder')}
                    className="flex-grow p-2 bg-transparent border-b border-morandi-border focus:border-morandi-primary focus:outline-none text-sm text-morandi-text"
                  />
                  <button onClick={() => removeIngredient(ing.id)} className="text-gray-300 hover:text-red-400">
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddIngredient}
              className="mt-3 text-sm font-medium text-morandi-primary hover:text-morandi-text flex items-center gap-1"
            >
              <Plus size={16} /> {t('recipeForm.addIngredient')}
            </button>
          </div>

          {/* Steps */}
          <div>
            <h3 className="text-lg font-semibold text-morandi-text mb-3">{t('recipeForm.instructions')}</h3>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex gap-3 animate-fade-in">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-morandi-secondary/50 text-morandi-text text-xs font-bold flex items-center justify-center mt-1">
                    {index + 1}
                  </div>
                  <textarea
                    value={step.text}
                    onChange={(e) => handleStepChange(step.id, e.target.value)}
                    placeholder={t('recipeForm.stepPlaceholder')}
                    rows={2}
                    className="flex-grow p-2 bg-morandi-bg/50 rounded-lg text-sm text-morandi-text focus:bg-white focus:ring-1 focus:ring-morandi-primary outline-none transition-colors"
                  />
                  <button onClick={() => removeStep(step.id)} className="text-gray-300 hover:text-red-400 self-start mt-2">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button 
              onClick={handleAddStep}
              className="mt-3 text-sm font-medium text-morandi-primary hover:text-morandi-text flex items-center gap-1"
            >
              <Plus size={16} /> {t('recipeForm.addStep')}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-4">
            <button 
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl font-semibold text-morandi-text bg-morandi-bg hover:bg-gray-200 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              onClick={handleSubmit}
              className="flex-1 py-3 rounded-xl font-semibold text-white bg-morandi-primary hover:opacity-90 transition-opacity shadow-md shadow-morandi-primary/30"
            >
              {t('recipeForm.saveRecipe')}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};