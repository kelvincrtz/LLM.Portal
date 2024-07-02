export default defineEventHandler(async (event) => {
    
    const { code } = event.context.params
    const { currencyKey } = useRuntimeConfig()
    // const { currencyKey, bearerToken } = useRuntimeConfig()
    const uri = `https://api.currencyapi.com/v3/latest?currencies=${code}&apikey=${currencyKey}`;

    const { data } = await $fetch(uri);

    // Example of Post with BearerToken
    //const { data } = await $fetch(uri, {
    //    method: 'POST',
    //    headers: {
    //        'Authorization': `Bearer ${bearerToken}`
    //    }
    //});

    return data 
})