PRD gerado para criação da feature de campos de potência (em Watts) e tensão (em Volts) no formulário de peças.

Utilizador: Mecânico de máquinas
Eu como o mecânico e principal interessado em ver de maneira simples e organizada as medidas de potência (medida em Watts) e tensão (medida em Volts) das peças as quais estou trabalhando.

Requisitos de negócio:
- No formulário de peças, adicionar os campos Potência (W) e Tensão (V) acima dos campos de Tags no formulário;
- Ambos campos devem ser representações de números inteiros e aceitar valores com no máximo 8 dígitos;
- Os campos não são obrigatórios de preenchimento, salvando os valores como padrão como 0;
- Seguir o mesmo padrão dos campos de Quantidade e Peso para a disposição em tela: campos ocupando metade da linha do grid cada um, não necessário uma linha inteira para cada;

Requisitos técnicos:
- Criar migration no banco de dados para aceitar os dois novos campos;
- Adicionar os campos novos em tela considerando as validações de tipo de valores conforme os requisitos de negócio e respeitando os espaçamentos antes previstos;
- Utilizar NOT NULL DEFAULT 0 para os novos campos em banco de dados;

Nota de implementação:
- As peças são armazenadas como JSON embedded na coluna `parts` da tabela `machines`, não existindo uma tabela separada de peças. Portanto, nenhum `ALTER TABLE` SQL é necessário — a "migração" é transparente: registros antigos simplesmente não terão os campos `power` e `voltage` no JSON, e o desserializador os trata com default 0. Isso foi alinhado com o time e documentado aqui para rastreabilidade.