# Introdução

O Jogo do 8 é um quebra-cabeça inventado na década de 1870. Consiste em uma grade 3x3 com 8 peças numeradas de 1 à 8 com um espaço vazio. O objetivo é reorganizar as peças numeradas em ordem, deslizando as peças no espaço vazio. O estado solucionado é da seguinte maneira:

Assim, foi solicitado a criação de um programa que resolvesse o jogo utilizando três diferentes heurísticas de conhecimento.

O jogo foi implementado utilizando a linguagem TypeScript, uma linguagem de programação que adiciona tipagem estática no JavaScript, juntamente com a biblioteca voltada para criações de interface React. O código está disponível no GitHub e, para maior disponibilidade e praticidade de execução, o jogo está hospedado na web.

Algumas das ideias que o professor sugeriu em sala para a resolução do problema foram modificadas. Por exemplo, para evitar situações de tabuleiro repetidas (isto é, a mesma disposição de peças se repetir), foi feito o uso de hash para cada um dos tabuleiros que foram já visitados, ou seja, tabuleiros que são parte da resolução final do quebra-cabeça. Dessa forma, não é possível revisitar um tabuleiro. Porém, ao mesmo tempo cria-se um outro problema: “— E se em algum momento da resolução o algoritmo não tiver para onde seguir?” Então, o algoritmo escolhe aleatoriamente entre os tabuleiros já visitados possíveis, e assim seguir a resolução do Jogo do 8.

Outra ideia modificada foi no cálculo da distância, na qual foi utilizada uma distância de City Block. O algoritmo calcula a distância de cada peça para a sua posição correta na matriz do tabuleiro, e soma todas as distâncias, criando assim uma pontuação para o tabuleiro. Para a finalização do tabuleiro, teoricamente (com exceção de 0) a menor pontuação possível é sempre a melhor, pois a distância calculada no tabuleiro resolvido é sempre igual a 0.

# Heurística 1

A Heurística 1 baseia-se no algoritmo de busca Greedy, do inglês, algoritmo Guloso. Esse algoritmo calcula os possíveis caminhos a serem seguidos a partir do tabuleiro atual, e verifica qual deles é o mais vantajoso, isto é, o caminho com menor custo. Então segue por esse caminho escolhido e refaz o algoritmo até que encontre a solução com distâncias calculadas igual a zero.

A média geral de movimentos da Heurística 1 é de 235 movimentos para a resolução de um tabuleiro qualquer embaralhado com 100 movimentos aleatórios.

# Heurística 2

A Heurística 2 também baseia-se no algoritmo de busca Greedy. Da mesma maneira, o algoritmo encontra o possível melhor caminho a ser seguido. Porém, ao invés de analisar diretamente os filhos (tabuleiros possíveis a partir do atual)do tabuleiro atual, é feita uma análise dos netos. Outrossim, a escolha é feita buscando encontrar o neto com o melhor caminho para a resolução.

O algoritmo funciona consoante a seguinte descrição: primeiramente, dado o tabuleiro atual, são encontrados seus filhos e verifica-se se algum deles já foi visitado — o que faz com que não exista a necessidade de analisá-los. Na sequência, é feita uma análise nos tabuleiros-filhos restantes para verificar se são a solução do tabuleiro. Depois disso, estudam-se os netos desses tabuleiros, da seguinte forma: primeiro descobre-se o valor de cada um dos tabuleiros netos e depois ordena-os da melhor pontuação possível para a menor; filtra-se o tabuleiros-netos que já foram visitados e então move-se para o filho que é pai do neto com menor pontuação (melhor). Caso, como na Heurística 1, não houver nenhum tabuleiro não visitado para ir, é pego um tabuleiro-filho qualquer de forma aleatória.

No caso da Heurística 2, a média geral de movimentos é de movimentos 95 para a resolução de um tabuleiro qualquer embaralhado com 100 movimentos aleatórios. Logo, é possível observar que existe uma melhora na redução do número de movimentos. Neste caso o número de movimentos é menos da metade da Heurística 1.

# Heurística Pessoal

A Heurística Pessoal para a resolução do quebra cabeça foi desenvolvida com base na Heurística 2. A ideia principal é novamente analisar os netos do tabuleiro atual, porém agora ao invés de apenas escolher o tabuleiro neto com a melhor pontuação, faz-se uma média entre os pontos dos netos de cada filho. Assim, verifica-se qual tabuleiro filho tem a melhor média de netos.

Da mesma forma que as Heurísticas 1 e 2, faz-se necessário evitar loops de movimentos, sendo aplicado a mesma ideia de tabela hash para evitar os loops.

Para a Heurística pessoal, a média geral de movimentos é de 155 para se resolver um tabuleiro embaralhado com 100 movimentos aleatórios. Como pode-se observar que a Heurística Pessoal obteve resultado entre as duas anteriores. Entretanto, neste caso a média de movimentos continua melhor que o caso da Heurística 1.

# Conclusão

Com as análises dos resultados obtidos, podemos verificar que, principalmente para algoritmos Gulosos, o ideal é sempre analisar o maior número de possibilidades possíveis. Contudo, é algo extremamente custoso computacionalmente o que torna inviável a sua materialização. Assim, como forma de minimizar este impacto, é feita uma busca somente em poucas possibilidades.

Logo, podemos montar um ranque com as três heurísticas apilicadas da seguinte forma: em primeiro lugar, a Heurística 2, em segundo a Heurística Pessoal, em terceiro a Heurística 1.

# Desenvolvedores

- [Gustavo Becelli](https://github.com/becelli): Ingressante 2020.
- [Guilherme Batalhoti](https://github.com/GuiBatalhoti): Ingressante 2020.
