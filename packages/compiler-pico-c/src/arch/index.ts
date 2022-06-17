import * as X86_16 from '@x86-toolkit/codegen';

import {CCompilerArch} from '../constants';
import {CArchDescriptor} from './types';

const COMPILER_ARCH_DESCRIPTORS: Record<CCompilerArch, Readonly<CArchDescriptor>> = {
  [CCompilerArch.X86_16]: {
    sizeofPrimitiveType: X86_16.sizeofPrimitiveType,
    regs: {
      integral: {
        maxRegSize: 2,
      },
    },
  },
};

export function getCompilerArchDescriptor(arch: CCompilerArch) {
  return COMPILER_ARCH_DESCRIPTORS[arch];
}
