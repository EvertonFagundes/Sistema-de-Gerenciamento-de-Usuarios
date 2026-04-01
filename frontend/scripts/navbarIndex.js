const navbarHTML = `
    <ul id="ul-1">
        <li>
            <a href="#">Users Gerence</a>
        </li>
    </ul>
    <button id="menuHamburguer">
        <a href="">
            <img id="imgHamburguer" src="./assets/menuHamburguer.png" alt="menu Hamburguer">
            <img id="iconeX" src="./assets/x_icon_152489.png" alt="ícone x">
        </a>
    </button>
    <ul id="ul-2">
        <li>
            <a href="index.html">Home</a>
        </li>
        <li>
            <a href="#">Contato</a>
        </li>
        <li>
            <a href="#">Sobre</a>
        </li>
    </ul>
`;

document.querySelector(".navbar").innerHTML = navbarHTML;