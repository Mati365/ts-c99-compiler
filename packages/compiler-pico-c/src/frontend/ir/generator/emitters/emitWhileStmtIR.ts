import {TokenType} from '@compiler/lexer/shared';
import {CPrimitiveType} from '@compiler/pico-c/frontend/analyze';
import {ASTCWhileStatement} from '@compiler/pico-c/frontend/parser';

import {IRFnDeclInstruction, IRIfInstruction, IRJmpInstruction, IRRelInstruction} from '../../instructions';
import {IRConstant} from '../../variables';
import {
  createBlankStmtResult,
  IREmitterContextAttrs,
  IREmitterStmtResult,
} from './types';

export type WhilteStmtIRAttrs = IREmitterContextAttrs & {
  node: ASTCWhileStatement;
  fnDecl: IRFnDeclInstruction;
};

export function emitWhileStmtIR(
  {
    scope,
    context,
    node,
    fnDecl,
  }: WhilteStmtIRAttrs,
): IREmitterStmtResult {
  const {emit, config, factory} = context;
  const {arch} = config;

  const result = createBlankStmtResult();
  const logicResult = emit.logicExpression(
    {
      scope,
      context,
      node: node.expression,
    },
  );

  const labels = {
    start: factory.genTmpLabelInstruction(),
    end: factory.genTmpLabelInstruction(),
  };

  const contentResult = emit.block(
    {
      node: node.statement,
      fnDecl,
      scope,
      context,
    },
  );

  result.instructions.push(
    labels.start,
    ...result.instructions,
    new IRIfInstruction(
      new IRRelInstruction(
        TokenType.EQUAL,
        logicResult.output,
        IRConstant.ofConstant(CPrimitiveType.int(arch), 0),
      ),
      labels.end,
    ),
    ...contentResult.instructions,
    new IRJmpInstruction(labels.start),
    labels.end,
  );

  return result;
}
