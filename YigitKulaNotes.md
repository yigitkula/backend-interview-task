

## How might you make this service more secure?
- We can setup a firewall between those microservices. This way we can only accept requests from allowed IP's.
- Use an API KEY or an Authentication pattern to make sure the request is coming from an allowed service.
- We can use domains instead of IPS. With domains we can switch from http to https. That way we can secure our networks from sniffing if any service domain / ip is exposed.         


## How would you make this solution scale to millions of records?
Fist of all if there are millions of Investments, the report would be generated asyncronously.

The first implementation that I would do is adding a pagination system to Investments service.
The request should be something like this:
```
    {investmentserviceurl}/investments?start=0&itemsPerPage=50
``` 

By adding a pagination, the response from investments endpoint would be:

```json
{
    "investments": [{id: 1, userId:1,firstName:"John"...},...]
    "total": number_of_total_investments
    "start": index_of_first_item_in_investments
    "end": index_of_last_item_in_investments
}
``` 
This allows us to scale our service without major problems.
 

Afterwards, I would add a queue system to Admin service.
When the admin service gets a report request, it would run like following:
1- Save the request to db/redis and generate a link to user. For example "/downloads/{request_id}"
2- Fetch investments
3- Fetch companies included in investments data
4- Aggragate rows and store it.
5- Return to step 2 until all the investments are received.
6- Upload csv file to service / send download link to user  

## What else would you have liked to improve given more time?
Adding user and date filters will be the first thing I would do.
Then I would switch all requests to service layer. That will increase code readability, and reusability.
Effective use or Ramda / functional programming 
