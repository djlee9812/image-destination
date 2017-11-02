from bs4 import BeautifulSoup
import urllib
import json
#put in link here
r = urllib.urlopen('http://brilliantmaps.com/top-100-tourist-destinations/').read()
q = urllib.urlopen('http://www.airportcodes.org/')
soup = BeautifulSoup(r)
airportsoup = BeautifulSoup(q)

citydata = soup.find_all('tr')
airportdata = airportsoup.find('p')
places = {}
for i in range(len(citydata)-1):
	places[i] = {}
	if(citydata[i+1].a):
		places[i]['city'] = citydata[i+1].a.get_text().encode('utf-8') 		
	else:
		places[i]['city'] = citydata[i+1].contents[2].get_text().encode('utf-8')
	places[i]['country'] = citydata[i+1].contents[3].get_text().encode('utf-8')

with open("places.json", "w") as writeJSON:
    json.dump(places, writeJSON)
