# 🎨 Funcionalidades do The Organizer

## ✨ Sistema de Temas

### Tema Claro (Light)
- Fundo suave cinza claro (#f5f5f7)
- Perfeito para ambientes bem iluminados
- Alto contraste para melhor legibilidade

### Tema Escuro (Dark)
- Fundo preto puro (#000000)
- Reduz fadiga ocular em ambientes com pouca luz
- Cores vibrantes otimizadas para dark mode

### Toggle de Tema
- **Localização**: Botão ao lado do título "The Organizer"
- **Ícone**: Sol ☀️ no tema claro / Lua 🌙 no tema escuro
- **Persistência**: Sua preferência é salva automaticamente
- **Transição**: Animação suave de 300ms

## 🔮 Glassmorphism Effect

### O que é Glassmorphism?
Efeito de "vidro fosco" popularizado pelo design moderno:
- Fundo semi-transparente
- Blur (desfoque) intenso de 60px
- Bordas sutis com brilho interno
- Sombras profundas e elegantes

### Aplicado em:
1. **Notas Adesivas**
   - Backdrop filter com saturação de 180%
   - Sombras múltiplas em camadas
   - Efeito de elevação ao hover
   - Escala sutil ao arrastar

2. **Barra de Ferramentas**
   - Blur de 60px
   - Transparência adaptativa ao tema
   - Sombra sutil

### Interações Visuais
- **Hover**: Elevação de -2px + sombra mais forte
- **Dragging**: Scale 1.02 + sombra profunda
- **Resizing**: Mesma elevação do dragging
- **Delete Button**: Aparece com fade-in suave

## 🎨 Paleta de Cores

### Tema Claro
```
Azul:    #007aff
Roxo:    #af52de
Rosa:    #ff2d55
Laranja: #ff9500
Amarelo: #ffcc00
Verde:   #34c759
```

### Tema Escuro
```
Azul:    #0a84ff (mais claro)
Roxo:    #bf5af2 (mais vibrante)
Rosa:    #ff375f (mais intenso)
Laranja: #ff9f0a (mais brilhante)
Amarelo: #ffd60a (mais luminoso)
Verde:   #30d158 (mais vivo)
```

## 🎯 Animações e Transições

### Duração
- Tema: 300ms
- Hover: 200ms
- Sombras: 300ms
- Transform: 200ms

### Curva de Animação
```css
cubic-bezier(0.25, 0.46, 0.45, 0.94)
```
*Curva suave inspirada nas animações iOS*

## 💡 Dicas de UX

1. **Notas no Dark Mode**: As cores ficam mais vibrantes e fáceis de distinguir
2. **Grade Adaptativa**: Pontos mais visíveis no dark mode
3. **Contraste Alto**: Texto sempre legível em ambos os temas
4. **Glassmorphism**: Funciona melhor quando há notas sobrepostas

## 🚀 Performance

- **GPU Acelerado**: backdrop-filter usa aceleração de hardware
- **Transições CSS**: Mais performáticas que JavaScript
- **Repaints Otimizados**: Transform não causa reflow
- **LocalStorage**: Carregamento instantâneo do tema salvo

