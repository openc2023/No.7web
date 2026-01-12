
import React from 'react';
import { ComponentDefinition } from '../../../types';
import { COMMON_GRID_FIELDS } from '../common';

export const Spacer: React.FC<any> = () => {
    return <div className="w-full h-full min-h-[50px] pointer-events-none" />;
};

export const SpacerDef: ComponentDefinition = {
    name: 'Spacer',
    slug: 'spacer',
    category: 'Layout',
    icon: 'box',
    enabled: true,
    version: '1.0',
    schema: {
        fields: [...COMMON_GRID_FIELDS as any],
        bindings: {}
    },
    render: () => `<div></div>`
};
