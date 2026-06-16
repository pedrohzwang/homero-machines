PRD gerado para criação da feature de tags personalizadas nos cadastros de Peças e Máquinas

Utilizador: Mecânico de máquinas
Eu como o mecânico e principal interessado em ver de maneira simples e organizada as diferentes peças parecidas do meu estoque de máquinas desejo poder cadastrar as peças com novas tags personalizadas que apareçam de maneiras desatacadas tanto na listagem de máquinas, quanto na listagem de peças e sejam fáceis de editar/adicionar nestes respectivos cadastros.

Requisitos de negócio:
- No formulário de máquinas e no formulário de peças serão adicionados agora, sendo os últimos campos do formulário, uma seção chamada "Tags";
- Esta seção com campos personalizados será composta por um campo de texto livre, com tamanho máximo de 20 caracteres, e um botão de adição de nova tag (+);
- O botão deve ficar habilitado sempre e, ao preencher o campo e adicionar um texto, deverá ser adicionada a nova tag personalizada na lista de palavras de tag;
- Caso o campo não tenha sido preenchido com nenhum texto não deve acontecer nenhuma ação ao clique do botão;
- Após a tag ser cadastrada, o botão ao lado da tag, que antes seria de adição, dará lugar a um botão de exclusão, nos mesmos moldes da da remoção da listagem de peças;
- O usuário pode cadastrar quantas tags personalizadas quiser;
- Deve ser possível reordenar as tags de lugar na tela, pois como mostraremos apenas as 5 primeiras, o usuário deve poder escolher quais são mais pertinentes para aparecer na listagem. A reordenação será feita por botões ↑ e ↓ ao lado de cada tag (sem drag-and-drop, para evitar dependências extras), conforme alinhado com o time;
- Na listagem de peças de uma máquina, apenas as 5 primeiras tags aparecerão na listagem. Esta abordagem serve para dar uma melhor visibilidade nas informações da peça, pois podem haver peças semelhantes com propriedades diferentes, ou até que tenham finalidades diferentes;
- Mesmo comportamento de mostrar as 5 primeiras tags deve ser replicado para a listagem de máquinas;
- O badge de quantidade de peças exibido anteriormente na listagem de máquinas foi removido, sendo substituído pela exibição das tags;
- As tags devem ter uma cor azul correspondente ao design pré estabelecido para esta aplicação.

Requisitos técnicos:
- Utilizar algum componente correspondente de tags ou badges para representação das tags personalizadas nas listagens das bibliotecas de componentes que estamos utilizando atualmente no projeto;
- Adicionar uma migração de banco de dados que adiciona os campos de tags nas tabelas de peças e máquinas, que será um campo json para ambas entidades. No JSON, devem conter campos contendo o conteúdo da tag e a ordenação dos conteúdos no array de tags deve ser a mesma ordenação proposta pelo usuário no formulário, precisamos obedecer à risca a ordem estabelecida por ele;
- Nas validações dos formulários verificar que o máximo permitido para uma tag é de 20 caracteres;
- Ao exibir as tags nas listagens, considerar sempre as primeiras 5 tags somente;
- Se caso haja algum problema relacionado a performance na possível implementação ou processamento das tags no salvamento ou listagem, favor apresentar ao final da implementação para que sejam elaboradas as refatorações cabíveis;