
import React from 'react';
import { ComponentDefinition } from '../types';

import { PageHeader, PageHeaderDef } from '../components/blocks/page-header';
import { ProfileSection, ProfileSectionDef } from '../components/blocks/profile-section';
import { LinkCard, LinkCardDef } from '../components/blocks/my-card';
import { BentoItem, BentoItemDef } from '../components/blocks/bento-item';
import { TechStack, TechStackDef } from '../components/blocks/tech-stack';
import { RichText, RichTextDef } from '../components/blocks/rich-text';
import { Spacer, SpacerDef } from '../components/blocks/spacer';
import { ChildPagesGrid, ChildPagesGridDef } from '../components/blocks/child-pages-grid';

// ==========================================
// Registry & Definitions
// ==========================================

export const BLOCK_DEFINITIONS: ComponentDefinition[] = [
  ProfileSectionDef,
  LinkCardDef,
  BentoItemDef,
  ChildPagesGridDef, // Added here
  TechStackDef,
  PageHeaderDef,
  RichTextDef,
  SpacerDef
];

export const BLOCK_REGISTRY: Record<string, React.FC<any>> = {
  [PageHeaderDef.slug]: PageHeader,
  [ProfileSectionDef.slug]: ProfileSection,
  [LinkCardDef.slug]: LinkCard,
  [BentoItemDef.slug]: BentoItem,
  [ChildPagesGridDef.slug]: ChildPagesGrid, // Added here
  [TechStackDef.slug]: TechStack,
  [RichTextDef.slug]: RichText,
  [SpacerDef.slug]: Spacer
};
