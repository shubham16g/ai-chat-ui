function mockDoQuery(queryText, onPlanReceived, onResultReceived, onSuggestions, onError) {
    // setTimeout(() => {
    //     onError('An error occurred while fetching data. Please try again later.');
    // }, 3000);
    // return;
    setTimeout(() => {
        onPlanReceived("This is the plan data. The plan data will load before the result data in typewritter effect. Once the result will received, the speed of typewritter effect will increase and once typed, the result will be displayed in the result area.");
    }, 1000);

    setTimeout(() => {
        onSuggestions([
            'Suggest Some cheap stocks',
            'What is the market cap of TCS',
            'Top 10 stocks in automotive industry',
            'Most invested Stock',
        ]);
    }, 4000);

    setTimeout(() => {
        onResultReceived(`Here is the Data
<br><br><table border="1" class="dataframe table">
  <thead>
    <tr style="text-align: right;">
      <th>Name</th>
      <th>Age</th>
      <th>City</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>John</td>
      <td>25</td>
      <td>New York</td>
    </tr>
    <tr>
      <td>Alice</td>
      <td>30</td>
      <td>Los Angeles</td>
    </tr>
    <tr>
      <td>Bob</td>
      <td>35</td>
      <td>Chicago</td>
    </tr>
    <tr>
      <td>Emily</td>
      <td>28</td>
      <td>San Francisco</td>
    </tr>
    <tr>
      <td>David</td>
      <td>40</td>
      <td>Seattle</td>
    </tr>
  </tbody>
</table>`);
    }, 2000);
    
}
