## geo.txt
Географические названия из опен-корпора из которых исключены слова,
которые так же могут быть существительными. Создан полуавтоматически.
Из словаря выбраны все Гео и из них исключены все не-Гео.

Обработка книги для использования как словарь
`ls ./ | xargs cat | mystem -lwdni | grep S | grep неод | sed s/=/\ /g | c1 | sort | uniq | awk '{ print "\""$1"\"," }' | grep -v '-'`

    -l – Print only lemmas, without
    -n – Print every word on a new
    -d – Выбирает один вариант из возможных
    -i – Print grammatical information
     S – Существительные
     неод – Неодушевленное

Из обработанного phon словаря в массив массивов
`cat ~/Downloads/phon/child_words.phon | awk '{ print "[\""$1"\"," "\""$2"\"]," }' > inan.raw.json`

Существительные неодушевленные именительный падеж
`cat ~/Downloads/dict.opcorpora.txt | grep 'NOUN.*inan.*sing.*nomn' | grep -v Geox | grep -v Orgn | grep -v 'V-be' | grep -v Sgtm | grep -v Erro | grep -v '-'| grep -v Infr | grep -v Slng | grep -v СЕКС | grep -v ^ПОРНО | grep -v ^ОНКО | grep -v ^СМЕРТ | grep -v ^УБИЙ | grep -v ^ПЕНИС | grep -v ^ДРОЧ | grep -v ХРЕНЬ | grep -v НАСИЛ | grep -v МАСТУР | grep -v ОРГАЗ | grep -v СПЕРМ | grep -v ^КОНДОМ | grep -v ЖОПА | grep -v ^ПЕДЕР | grep -v ФЕКА | grep -v ТРАХАН | grep -v ИНТИМ | grep -v ПРОСТИТ | grep -v ЧЛЕН | grep -v НАРКО | grep -v СОВРА | grep -v ВЛАГАЛ | grep -v СОСОК | grep -v ПОНОС | grep -v ^МОЧЕ | grep -v МАНЬЯ | grep -v ПСИХО | grep -v АБОРТ | grep -v ^КРОВО | grep -v ГОМО | grep -v ^ЛОБОК | grep -v ПРОСТАТ | grep -v ВАГИН | grep -v УГОЛОВ | grep -v СУИЦ | grep -v ДЕРМА | grep -v 'ТИТ\W' | grep -v ^ПАТО | grep -v ДЕВСТ | grep -v ^ЭРО | grep -v ^ГЕНО`
