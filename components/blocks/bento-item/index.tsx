
import React, { useState, useEffect } from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS, getCommonBlockStyle, BlockBackground, renderStaticBackground, getCommonStaticStyleString } from '../common';

export const BentoItem: React.FC<any> = (props) => {
  const { 
      title, 
      subTitle,
      mediaType = 'image', 
      image, 
      video, 
      slides,
      textPosition = 'bottom-left' 
  } = props;
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideUrls = slides ? slides.split(',').map((s: string) => s.trim()).filter((s: string) => s) : [];

  useEffect(() => {
      if (mediaType === 'slideshow' && slideUrls.length > 1) {
          const timer = setInterval(() => {
              setCurrentSlide(prev => (prev + 1) % slideUrls.length);
          }, 3000); // 3 seconds per slide
          return () => clearInterval(timer);
      }
  }, [mediaType, slideUrls.length]);

  // Position Logic Mapping
  const positionClasses: Record<string, string> = {
      'top-left': 'justify-start items-start text-left',
      'top-center': 'justify-start items-center text-center',
      'top-right': 'justify-start items-end text-right',
      'center-left': 'justify-center items-start text-left',
      'center': 'justify-center items-center text-center',
      'center-right': 'justify-center items-end text-right',
      'bottom-left': 'justify-end items-start text-left',
      'bottom-center': 'justify-end items-center text-center',
      'bottom-right': 'justify-end items-end text-right',
  };

  const overlayClasses: Record<string, string> = {
      'top-left': 'bg-gradient-to-b from-black/80 via-black/20 to-transparent',
      'top-center': 'bg-gradient-to-b from-black/80 via-black/20 to-transparent',
      'top-right': 'bg-gradient-to-b from-black/80 via-black/20 to-transparent',
      'center-left': 'bg-black/40',
      'center': 'bg-black/40',
      'center-right': 'bg-black/40',
      'bottom-left': 'bg-gradient-to-t from-black/90 via-black/20 to-transparent',
      'bottom-center': 'bg-gradient-to-t from-black/90 via-black/20 to-transparent',
      'bottom-right': 'bg-gradient-to-t from-black/90 via-black/20 to-transparent',
  };

  const containerClass = positionClasses[textPosition] || positionClasses['bottom-left'];
  const gradientClass = overlayClasses[textPosition] || overlayClasses['bottom-left'];

  return (
    <div 
        className="relative overflow-hidden group cursor-pointer h-full min-h-[100px]" 
        style={getCommonBlockStyle(props)}
    >
       <BlockBackground props={props} />

       {/* Media Layer */}
       <div className="absolute inset-0 z-0">
          {mediaType === 'video' && video ? (
             <video 
                src={video} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" 
             />
          ) : mediaType === 'slideshow' && slideUrls.length > 0 ? (
             <>
                {slideUrls.map((url: string, idx: number) => (
                    <img 
                        key={idx}
                        src={url} 
                        alt={`${title} - slide ${idx}`} 
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`} 
                    />
                ))}
             </>
          ) : (
             <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" 
             />
          )}
       </div>

       {/* Gradient Overlay for Text Readability */}
       <div className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${gradientClass}`} />

       {/* Text Content */}
       <div className={`relative z-10 w-full h-full p-5 flex flex-col ${containerClass}`}>
          <div className="transform transition-transform duration-300 group-hover:translate-y-[-2px]">
             {subTitle && (
                 <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1 opacity-90">{subTitle}</p>
             )}
             <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
          </div>
       </div>
    </div>
  );
};

export const BentoItemDef: ComponentDefinition = {
  name: 'Bento Card',
  slug: 'bento-item',
  category: 'Layout',
  icon: 'layout-grid',
  enabled: true,
  version: '2.0.0',
  schema: {
    fields: [
      { name: 'title', label: 'Title', type: 'string', default: 'Project Name' },
      { name: 'subTitle', label: 'Sub Title', type: 'string', default: 'Category' },
      { name: 'textPosition', label: 'Text Position', type: 'select', options: [
          'top-left', 'top-center', 'top-right',
          'center-left', 'center', 'center-right',
          'bottom-left', 'bottom-center', 'bottom-right'
      ], default: 'bottom-left' },
      
      { name: 'mediaType', label: 'Media Type', type: 'select', options: ['image', 'video', 'slideshow'], default: 'image' },
      
      // Conditional fields would be better in a real schema engine, but we list all for now
      { name: 'image', label: 'Image URL', type: 'image', default: 'https://picsum.photos/600/400' },
      { name: 'video', label: 'Video URL (MP4)', type: 'string', default: '' },
      { name: 'slides', label: 'Slides (Comma Sep URLs)', type: 'text', default: 'https://picsum.photos/600/400, https://picsum.photos/600/401' },
      
      ...COMMON_GRID_FIELDS as any
    ],
    bindings: {
      title: { mode: 'text', selector: 'h3' },
      subTitle: { mode: 'text', selector: 'p' },
      image: { mode: 'attr', attr: 'src', selector: 'img' }
    }
  },
  render: (p) => {
      let mediaHtml = '';
      if (p.mediaType === 'video' && p.video) {
          mediaHtml = `<video src="${p.video}" autoplay loop muted playsinline class="absolute inset-0 w-full h-full object-cover opacity-90"></video>`;
      } else {
          mediaHtml = `<img src="${p.image}" class="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-110" />`;
      }

      const posMap: any = {
        'bottom-left': 'justify-end items-start text-left',
        'center': 'justify-center items-center text-center',
      };
      const alignClass = posMap[p.textPosition] || 'justify-end items-start text-left';

      return `
        <div class="glass-panel relative w-full h-full overflow-hidden group cursor-pointer" style="${getCommonStaticStyleString(p)}">
             ${renderStaticBackground(p)}
             ${mediaHtml}
             <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none"></div>
             <div class="relative z-10 w-full h-full p-5 flex flex-col ${alignClass}">
                <div class="transform transition-transform duration-300 group-hover:-translate-y-1">
                     ${p.subTitle ? `<p class="text-[10px] font-bold uppercase tracking-wider text-purple-400 mb-1 opacity-90">${p.subTitle}</p>` : ''}
                     <h3 class="text-xl font-bold text-white leading-tight">${p.title}</h3>
                </div>
             </div>
        </div>
      `;
  }
};
