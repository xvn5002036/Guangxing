import { Lunar } from 'lunar-javascript';
const l = Lunar.fromYmd(1987, 4, 10);
const b = l.getEightChar();

const getAllProps = (obj) => {
    let props = new Set();
    while(obj) {
        Object.getOwnPropertyNames(obj).forEach(p => props.add(p));
        obj = Object.getPrototypeOf(obj);
    }
    return [...props];
}

const lProps = getAllProps(l);
const bProps = getAllProps(b);

const query = ['DiShi', 'ChangSheng', 'Yun', 'MingGong', 'TaiYuan'];
const search = (props, name) => {
    console.log(`\nSearching in ${name}:`);
    props.forEach(p => {
        // substring match case insensitive
        if (query.some(q => p.toLowerCase().includes(q.toLowerCase()))) {
            console.log("Found:", p);
        }
    });
}

search(lProps, "Lunar");
search(bProps, "BaZi");
