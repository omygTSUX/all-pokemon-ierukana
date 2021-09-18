// 全ポケモンの数を動的に表示する関数
function setNumberOfPokemons(number_pokemons) {
    var element = document.getElementById('number_pokemons');
    element.textContent = number_pokemons;
}

// 残りポケモンの数を動的に表示する関数
function setRemainingNumber(remaining_number) {
    var element = document.getElementById('remaining_number');
    element.textContent = "残り" + padZero(remaining_number, 3) + "匹";
}

// ポケモンリストを動的に生成する関数
function createPokemonList(number_pokemons, number_start) {
    var ul = document.getElementById('pokemon_list');
    var fragment = document.createDocumentFragment();
    for (var p = 0; p < number_pokemons; p++) {
        var li = document.createElement('li');
        li.classList.add("li_wrapper");
        var div = document.createElement('div');
        var img = "./img/" + padZero(number_start + p, 3) + ".png";
        div.innerHTML = "<span>" + padZero(number_start + p, 3) + "</span>" +
            "<img src=" + img + " class='image_pokemon' loading='lazy'>";
        div.id = "pokemon_" + (number_start + p);
        div.classList.add("li_pokemon", "xx-small", "m-1");
        li.appendChild(div);
        fragment.appendChild(li);
    }
    ul.appendChild(fragment);
}

// 全ポケモンリストを読み込む関数
function getCSV() {
    var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成
    req.open("get", "all_pokemon.csv", true); // アクセスするファイルを指定
    req.send(null); // HTTPリクエストの発行

    // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
    req.onload = function () {
        convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
    }
}

// 読み込んだCSVデータを二次元配列に変換する関数
function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
    window.all_pokemon_list = []; // 最終的な二次元配列を入れるための配列
    var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成

    // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
    for (var i = 0; i < tmp.length; ++i) {
        all_pokemon_list[i] = tmp[i].split(',');
    }
}

// 数字を0埋めする関数
function padZero(v, digit) {
    var result = ("00000" + v).slice(-digit);
    return result;
}

// 数字を時間に変換する関数
function toHms(t) {
    var hms = "";
    var h = t / 3600 | 0;
    var m = t % 3600 / 60 | 0;
    var s = t % 60;

    hms = padZero(h, 3) + ":" + padZero(m, 2) + ":" + padZero(s, 2);

    return hms;
}

// 時間を日本語に変換する関数
function toJapaneseHms(hms) {
    var japaneseHms = hms.split(":");
    var ji = Number(japaneseHms[0]);
    var hun = Number(japaneseHms[1]);
    var byou = Number(japaneseHms[2]);

    return ji + "時間" + hun + "分" + byou + "秒";
}

// タイマーを動かす関数
function setTime() {
    var shown_time = new Date().getTime() - start_time;
    var timer = document.getElementById('timer');
    timer.textContent = toHms(Math.floor(shown_time / 1000));
}

// タイマーをスタートする関数
function startTimer() {
    window.timer_count = setInterval("setTime()", 1000);
}

// タイマーをストップする関数
function stopTimer() {
    clearInterval(timer_count);
}

// HTML読み込み時に自動実行する関数
window.addEventListener("DOMContentLoaded", function () {
    getCSV();
    window.answered_list = Array(number_pokemons + 1).fill(false)
    window.remaining_number = number_pokemons;
    setNumberOfPokemons(number_pokemons);
    setRemainingNumber(number_pokemons);
    createPokemonList(number_pokemons, number_start);
}, false);

// 開始ボタンを押した時に実行される関数
document.getElementById("button_start").onclick = function () {
    var button = document.getElementById("button_start");
    // 開始する時
    if (button.classList.contains("stopped")) {
        window.start_time = new Date().getTime();
        startTimer();
        document.getElementById("input_answer").removeAttribute("disabled");
        document.getElementById("button_answer").removeAttribute("disabled");
        button.textContent = "降参";
        button.classList.replace('btn-success', 'btn-danger');
        button.classList.remove("stopped");

        remaining_number = number_pokemons;
        setRemainingNumber(remaining_number);
        answered_list.fill(false);

        var li_pokemons = document.getElementsByClassName('li_pokemon');
        for (li of li_pokemons) {
            li.classList.remove("found", "not_answered");
        }
    }
    // 降参する時
    else {
        var answered_list_local = answered_list;
        stopTimer();
        document.getElementById("input_answer").setAttribute("disabled", true);
        document.getElementById("button_answer").setAttribute("disabled", true);
        button.textContent = "開始";
        button.classList.replace('btn-danger', 'btn-success');
        button.classList.add('stopped');

        var li_pokemons = document.getElementsByClassName('li_pokemon');
        for (li of li_pokemons) {
            var id = li.id.slice(8);
            if (!answered_list_local[id - number_start + 1]) {
                li.classList.add("found", "not_answered");
            }
        }
    }

    return false;
}

// 回答ボタンを押した時に実行される関数
document.getElementById("form_answer").onsubmit = function () {
    var value = document.getElementById("input_answer").value;
    checkAnswer(value);
    return false;
}

// ひらがなをカタカナに直す関数
function hiraToKata(str) {
    return str.replace(/[\u3041-\u3096]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) + 0x60)
    );
}

// 入力の表記揺れを直す関数
function eratta(answer) {
    var eratta_result = answer;
    eratta_result = hiraToKata(answer);
    var eratta_list = [
        ["ニドランオス", "ニドラン♂"],
        ["ニドランメス", "ニドラン♀"],
        ["ポリゴンツー", "ポリゴン2"],
        ["ポリゴン２", "ポリゴン2"],
        ["ポリゴンゼット", "ポリゴンZ"],
        ["ポリゴンｚ", "ポリゴンZ"],
        ["ポリゴンＺ", "ポリゴンZ"],
        ["ポリゴンz", "ポリゴンZ"],
        ["タイプヌル", "タイプ:ヌル"],
        ["タイプ：ヌル", "タイプ:ヌル"],
        ["カプ･コケコ", "カプ・コケコ"],
        ["カプコケコ", "カプ・コケコ"],
        ["カプ･テテフ", "カプ・テテフ"],
        ["カプテテフ", "カプ・テテフ"],
        ["カプ･ブルル", "カプ・ブルル"],
        ["カプブルル", "カプ・ブルル"],
        ["カプ･レヒレ", "カプ・レヒレ"],
        ["カプレヒレ", "カプ・レヒレ"]
    ];
    for (p of eratta_list) {
        if (eratta_result == p[0]) {
            eratta_result = p[1];
            break;
        }
    }
    return eratta_result;
}

// 正解判定をする関数
function checkAnswer(answer) {
    // if(answer=="クリア"){
    //     for(pokemon of all_pokemon_list.slice(number_start - 1, number_start + number_pokemons - 1)){
    //             remaining_number--;
    //             setRemainingNumber(remaining_number);
    //             document.form_answer.reset();
    //     }
    // }
    var eratta_result = eratta(answer);
    for (pokemon of all_pokemon_list.slice(number_start - 1, number_start + number_pokemons - 1)) {
        if (eratta_result == pokemon[1] && !answered_list[pokemon[0] - number_start + 1]) {
            var li = document.getElementById('pokemon_' + pokemon[0]);
            li.classList.add("found");
            answered_list[pokemon[0] - number_start + 1] = true;
            remaining_number--;
            setRemainingNumber(remaining_number);
            window.last_pokemon = pokemon[1];
            document.form_answer.reset();
            break;
        }
    }
}

// クリア判定をする関数
document.form_answer.onreset = function () {
    if (remaining_number == 0) {
        stopTimer();
        var button = document.getElementById("button_start");
        document.getElementById("input_answer").setAttribute("disabled", true);
        document.getElementById("button_answer").setAttribute("disabled", true);
        button.textContent = "開始";
        button.classList.replace('btn-danger', 'btn-success');
        button.classList.add('stopped');
        window.clear_message = setInterval("alertClearMessage()", 500);
    }
}

function alertClearMessage() {
    window.alert("クリアおめでとう！結果Tweetボタンでぜひ共有してください！");
    clearInterval(clear_message);
}

// ツイートボタンの文言を設定する関数
document.getElementById("button_tweet").onclick = function () {
    var time = toJapaneseHms(document.getElementById("timer").textContent);
    var number_answered = number_pokemons - remaining_number;
    var title = document.title;
    var url = location.href;
    var href;
    if (remaining_number == 0) {
        href = "https://twitter.com/share?text=" + time + "でポケモン" + number_answered + "/" + number_pokemons + "匹言えた！最後のポケモンは" + last_pokemon + "だった！ - " + title + "&url=" + url + "&hashtags=ポケモン全部言えるかな";
    }
    else {
        href = "https://twitter.com/share?text=" + time + "でポケモン" + number_answered + "/" + number_pokemons + "匹言えた！ - " + title + "&url=" + url + "&hashtags=ポケモン全部言えるかな";
    }
    window.open(encodeURI(decodeURI(href)), 'tweetwindow', 'width=650, height=470, personalbar=0, toolbar=0, scrollbars=1, sizable=1');
    return false;
}