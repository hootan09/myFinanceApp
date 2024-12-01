import { View, FlatList, StyleSheet, Text, StatusBar, RefreshControl } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react'
import urls from '@/constants/urls';
import cheerio from 'react-native-cheerio';

const price = () => {
    const [isFetching, setIsFetching] = useState<boolean>(false);
    const [data, setData] = useState<any>(null);
    const [list, setList] = useState<any>([]);

    const toEnDigit = (s:any)=> {
        return s.replace(/[\u0660-\u0669\u06f0-\u06f9]/g,    // Detect all Persian/Arabic Digit in range of their Unicode with a global RegEx character set
            (a: any)=> { return a.charCodeAt(0) & 0xf }     // Remove the Unicode base(2) range that not match
        )
    }

    const getPriceHtmlData = async () => {
        try {
            setIsFetching(true);
            let res = await fetch(urls.GetBaseURL(), {
                method: 'GET',
                // headers: {'Content-Type': 'application/json'},
                // body: JSON.stringify(''),
            });
            const htmlRawData = await res.text();
            setData(htmlRawData);
            // setIsFetching(false);
        } catch (e) {
            console.error(e);
            setIsFetching(false);
        }

    }

    const parseData = async () => {
        try {
            const parsedData: Array<object> = [
                // {
                //     headerTitle: 'gold and tec',
                //     data: [
                //         {
                //             title: 'gold coin',
                //             price: '100000',
                //             percent: '-1.1'
                //         }
                //     ]
                // }
            ];
            const $ = await cheerio.load(data, {
                // withDomLvl1: true,
                // normalizeWhitespace: false,
                // xmlMode: true,
                // decodeEntities: true
            });

            // $('.basket .basket__header .basket-header__title').each((index: number, elem: any)=> {
            //     parsedData.title.push($(elem).text());        
            // });

            // $('.basket .basket__body .finance-card .finance-card__header .finance-card-header__title').each((index: number, elem: any)=> {
            //     parsedData.data.push($(elem).text());        
            // });

            // $('.basket .basket__body .finance-card .finance-card__body .finance-card-body__item .value').each((index: number, elem: any)=> {
            //     parsedData.value.push($(elem).text());        
            // });

            // $('.basket .basket__body .finance-card .finance-card__body small').each((index: number, elem: any)=> {
            //     parsedData.percent.push($(elem).text());        
            // });

            $('.basket').each((index: number, elem: any) => {
                const item: any = { headerTitle: "", data: [] };
                const headerTitle = $(elem).find('.basket__header .basket-header__title').text()
                // console.log('-Header Title: ', headerTitle);
                item.headerTitle = headerTitle;
                item.data = [];
                $(elem).find('.basket__body .finance-card').each((id: number, elemItem: any) => {
                    let entity = { title: '', price: '', percent: '' }
                    const title = $(elemItem).find('.finance-card__header .finance-card-header__title').text();
                    // console.log('\t-----');
                    // console.log('\t--Title: ', title);
                    entity.title = title;
                    $(elemItem).find('.finance-card__body').each((idData: number, elemItemData: any) => {
                        let price = $(elemItemData).find('.finance-card-body__item .value').text();
                        let percent = $(elemItemData).find('small').text();
                        // console.log('\t--Price: ', price);
                        // console.log('\t--Percent: ', percent);
                        entity.price = price;
                        entity.percent = percent.replace('٫', '.');
                    });
                    // console.log(entity);
                    item.data.push(entity);
                })
                parsedData.push(item);
            });
            // console.log(JSON.stringify(parsedData));
            setList(parsedData);
            setIsFetching(false);
        } catch (error) {
            console.log(error);
            setIsFetching(true);
        }
    }

    useEffect(() => {
        getPriceHtmlData();
    }, [])

    useEffect(() => {
        parseData()
    }, [data])

    return (
        <SafeAreaProvider style={styles.container}>
            <SafeAreaView style={{flex: 1}}>
                <FlatList
                    refreshControl={
                        <RefreshControl refreshing={isFetching} onRefresh={getPriceHtmlData} />
                      }
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{alignItems: 'flex-end'}}
                    // style={{flex:1}}
                    data={list}
                    renderItem={({ item, index }) => 
                        <View key={index} style={styles.item}>
                            <Text style={[styles.title,{marginBottom: 15}]}>{item?.headerTitle}</Text>
                            {item?.data.map((entity: any, indexEntity: number) => (
                                <View key={indexEntity} style={{alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 15}}>
                                    <Text style={[styles.title, {fontSize: 22, color: toEnDigit(entity?.percent) == 0 ? 'white' : (toEnDigit(entity?.percent) > 0 ? 'green' : 'red') }]}>{entity?.percent}</Text>
                                    <Text style={[styles.title, {fontSize: 26,}]}>{entity?.price}</Text>
                                    <Text style={[styles.title, {fontSize: 30}]}>{entity?.title}</Text>
                                </View>
                            ))}
                        </View>
                    }
                    keyExtractor={(item, index) => index.toString()}
                />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default price

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        marginTop: StatusBar.currentHeight || 0,
        backgroundColor: 'black',
        // justifyContent: 'center',
        // alignContent: 'center',
        // alignItems: 'flex-end',
    },
    item: {
        // backgroundColor: '#f9c2ff',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
    },
    title: {
        // flex: 1,
        fontSize: 42,
        color: 'white',
    },
})    