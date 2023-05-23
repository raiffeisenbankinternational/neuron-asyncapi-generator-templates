from pulsar import SerDe
from pulsar.schema import *

{%- macro modelField(field, required) %}
{{- field.type() | lower | mapClassType(field.format()) }}({{'required=True' if required else 'required=False'}})
{%- endmacro %}

class {{messageName | upperFirst}}(Record):
{%- for fieldName, field in message.payload().properties() %}
    {{fieldName}} = {{modelField(field, fieldName in message.payload().required())}}
{%- endfor %}

class {{messageName | upperFirst}}SerDe(SerDe):
    def serialize(self, input):
        {{messageName | upperFirst}}Avro = AvroSchema({{messageName | upperFirst}})
        return {{messageName | upperFirst}}Avro.encode(input)
    def deserialize(self, input):
        {{messageName | upperFirst}}Avro = AvroSchema({{messageName | upperFirst}})
        return {{messageName | upperFirst}}Avro.decode(input)
