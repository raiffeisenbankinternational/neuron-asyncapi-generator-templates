{%- for messageName, message in asyncapi.allMessages() %}
from .{{messageName}} import {{messageName | upperFirst}}, {{messageName | upperFirst}}SerDe
{%- endfor %}
