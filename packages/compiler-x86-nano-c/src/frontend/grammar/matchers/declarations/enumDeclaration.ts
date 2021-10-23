import * as R from 'ramda';

import {NodeLocation} from '@compiler/grammar/tree/NodeLocation';
import {TokenType} from '@compiler/lexer/tokens';

import {constantExpression} from '../expressions/constantExpression';

import {CGrammar} from '../shared';
import {CCompilerKeyword} from '../../../../constants';
import {CGrammarError, CGrammarErrorCode} from '../../errors/CGrammarError';
import {
  ASTCConstantExpression,
  ASTCEnumEnumeration,
  ASTCEnumSpecifier,
} from '../../../ast';

/**
 * enumerator_list
 *  : enumerator
 *  | enumerator_list ',' enumerator
 *  ;
 *
 * enumerator
 *  : IDENTIFIER
 *  | IDENTIFIER '=' constant_expression
 *  ;
 *
 * @param {CGrammar} grammar
 * @return {ASTCEnumEnumeration[]}
 */
function enumEnumerations(grammar: CGrammar): ASTCEnumEnumeration[] {
  const {g} = grammar;
  const enumerations: ASTCEnumEnumeration[] = [];

  do {
    // handles empty enum error, do not reorder to end
    if (g.currentToken.text === '}')
      break;

    let expression: ASTCConstantExpression = null;
    const name = g.match(
      {
        type: TokenType.KEYWORD,
      },
    );

    const assignment = g.match(
      {
        type: TokenType.ASSIGN,
        optional: true,
      },
    );

    if (assignment) {
      expression = constantExpression(
        grammar,
        (token) => token.type === TokenType.COMMA || token.text === '}',
        true,
      );
    }

    enumerations.push(
      new ASTCEnumEnumeration(
        NodeLocation.fromTokenLoc(name.loc),
        name,
        expression,
      ),
    );

    if (g.currentToken.type === TokenType.COMMA)
      g.consume();
    else
      break;
  } while (true);

  return enumerations;
}

/**
 * Declaration of variable / constant
 *
 * @param {CGrammar} grammar
 * @returns {ASTCEnumSpecifier}
 */
export function enumDeclaration(grammar: CGrammar): ASTCEnumSpecifier {
  const {g} = grammar;
  const startToken = g.identifier(CCompilerKeyword.ENUM);
  const name = g.match(
    {
      type: TokenType.KEYWORD,
      optional: true,
    },
  );

  const emptyDeclaration = g.match(
    {
      type: TokenType.SEMICOLON,
      consume: false,
      optional: true,
    },
  );

  let enumerations = null;
  if (emptyDeclaration) {
    // handle enum Abc;
    g.consume();
  } else {
    // handle enum Abc {}
    g.terminal('{');

    enumerations = enumEnumerations(grammar);
    if (R.isEmpty(enumerations))
      throw new CGrammarError(CGrammarErrorCode.EMPTY_ENUM_DEFINITION);

    g.terminal('}');
  }

  g.match(
    {
      type: TokenType.SEMICOLON,
      optional: true,
    },
  );

  return new ASTCEnumSpecifier(
    NodeLocation.fromTokenLoc(startToken.loc),
    name,
    enumerations,
  );
}
